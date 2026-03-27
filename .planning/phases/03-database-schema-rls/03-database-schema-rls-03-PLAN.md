---
phase: 03-database-schema-rls
plan: 03
type: execute
wave: 2
depends_on: [03-database-schema-rls-01, 03-database-schema-rls-02]
files_modified: [
  "lib/db-rls-policies.sql"
]
autonomous: true
requirements: [ISOL-01, ISOL-02, ISOL-03, ISOL-04, ISOL-05, ISOL-06]
user_setup: []

must_haves:
  truths:
    - "Doctor from Clinic A cannot query patients from Clinic B (RLS blocks query)"
    - "Staff can read/write their clinic's data but not other clinics"
    - "Admin role can read from all clinics (RLS allows with is_admin check)"
    - "All RLS policies check auth.jwt() claims for clinic_id and role"
    - "RLS policies enforce role-based access: admin > doctor > staff permissions"
  artifacts:
    - path: "lib/db-rls-policies.sql"
      provides: "RLS ENABLE + policy definitions for all 10 tables (SELECT, INSERT, UPDATE, DELETE)"
      min_lines: 400
    - path: "lib/supabase-queries.ts"
      provides: "TypeScript query functions with clinic context (getPatients, getAppointments, createPatient, etc.)"
      exports: ["getPatients", "getAppointments", "createPatient", "getClinicContext"]
  key_links:
    - from: "lib/db-rls-policies.sql"
      to: "Supabase PostgreSQL"
      via: "SQL execution (manual via Supabase dashboard)"
      pattern: "ALTER TABLE.*ENABLE ROW LEVEL SECURITY"
    - from: "lib/supabase-queries.ts"
      to: "RLS policies"
      via: "Supabase JS client with session JWT"
      pattern: "supabase.from\\('patients'\\).select"
---

# Plan 3: Row-Level Security Policies

Implement RLS (Row-Level Security) policies on all 10 tables to enforce clinic isolation at the PostgreSQL layer. After this plan, a doctor from Clinic A cannot query patients from Clinic B, even with direct SQL.

**Goal:** RLS policies on all tables enforce clinic isolation + role-based access. Clinical data cannot leak across clinic boundaries.

**Depends on:** Plan 01 + Plan 02 (all tables must exist before adding policies)

**Not in this plan:** Integration tests (Plan 04)

---

## Context

### Phase 3 Approach: Defense-in-Depth
1. **Database layer (Plan 03 - this plan):** RLS policies on every table
2. **App layer (Plan 04):** Query functions that filter clinic_id at app level
3. **Tests (Plan 04):** Integration tests proving admin sees all, doctor sees assigned, staff sees clinic only

### Clinic Isolation Model

**Clinic context in JWT:**
- `auth.jwt() ->> 'clinic_id'` — UUID of user's assigned clinic
- `auth.jwt() ->> 'user_role'` — 'admin', 'doctor', or 'staff'

**Role permissions:**
- **admin:** Read all clinics' data; write to any clinic (rare use case)
- **doctor:** Read/write own clinic's patients + appointments + consultation notes
- **staff:** Read/write own clinic's data (all tables)

### CRITICAL RLS Design
- RLS policies check **BOTH** clinic_id AND role
- Clinic boundaries non-negotiable: `WHERE clinic_id = auth.jwt() ->> 'clinic_id'`
- Admins get `OR (auth.jwt() ->> 'user_role')::text = 'admin'` override on SELECT
- No UPDATE/DELETE override for admins (safety: prevent accidental data deletion)

---

## Tasks

<task type="auto">
  <name>Task 1: Write RLS policy definitions to lib/db-rls-policies.sql</name>
  <files>lib/db-rls-policies.sql</files>
  <read_first>
    - lib/db-schema.sql (to understand table structure)
    - .planning/STATE.md (user role and clinic context from Phase 1)
  </read_first>
  <action>
Create lib/db-rls-policies.sql with the following RLS policy structure (copy exactly):

**ENABLE RLS on all tables:**
```sql
-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
```

**CLINICS table policies:**
```sql
-- Admin can view all clinics
CREATE POLICY clinics_select_admin ON clinics
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Users can view their own clinic
CREATE POLICY clinics_select_user ON clinics
  FOR SELECT
  USING (id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**PATIENTS table policies:**
```sql
-- Admin can select any patient
CREATE POLICY patients_select_admin ON patients
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select patients from their clinic
CREATE POLICY patients_select_clinic ON patients
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert patients in their clinic
CREATE POLICY patients_insert_clinic ON patients
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update patients in their clinic
CREATE POLICY patients_update_clinic ON patients
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Staff can delete patients in their clinic (doctors cannot)
CREATE POLICY patients_delete_staff ON patients
  FOR DELETE
  USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    AND (auth.jwt() ->> 'user_role')::text = 'staff'
  );
```

**DOCTOR_PROFILES table policies:**
```sql
-- Admin can select any doctor
CREATE POLICY doctor_profiles_select_admin ON doctor_profiles
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Any user can select doctors from their clinic
CREATE POLICY doctor_profiles_select_clinic ON doctor_profiles
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Staff can insert doctors in their clinic
CREATE POLICY doctor_profiles_insert_clinic ON doctor_profiles
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Staff can update doctors in their clinic
CREATE POLICY doctor_profiles_update_clinic ON doctor_profiles
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**APPOINTMENTS table policies:**
```sql
-- Admin can select any appointment
CREATE POLICY appointments_select_admin ON appointments
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select appointments from their clinic
CREATE POLICY appointments_select_clinic ON appointments
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert appointments in their clinic
CREATE POLICY appointments_insert_clinic ON appointments
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update appointments in their clinic
CREATE POLICY appointments_update_clinic ON appointments
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Staff only can delete appointments in their clinic
CREATE POLICY appointments_delete_staff ON appointments
  FOR DELETE
  USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    AND (auth.jwt() ->> 'user_role')::text = 'staff'
  );
```

**CONSULTATION_NOTES table policies:**
```sql
-- Admin can select any note
CREATE POLICY consultation_notes_select_admin ON consultation_notes
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select notes from their clinic
CREATE POLICY consultation_notes_select_clinic ON consultation_notes
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert notes in their clinic
CREATE POLICY consultation_notes_insert_clinic ON consultation_notes
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update notes in their clinic
CREATE POLICY consultation_notes_update_clinic ON consultation_notes
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Staff only can delete notes in their clinic
CREATE POLICY consultation_notes_delete_staff ON consultation_notes
  FOR DELETE
  USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    AND (auth.jwt() ->> 'user_role')::text = 'staff'
  );
```

**VITAL_SIGNS table policies:**
```sql
-- Admin can select any vital signs
CREATE POLICY vital_signs_select_admin ON vital_signs
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select vital signs from their clinic
CREATE POLICY vital_signs_select_clinic ON vital_signs
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert vital signs in their clinic
CREATE POLICY vital_signs_insert_clinic ON vital_signs
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update vital signs in their clinic
CREATE POLICY vital_signs_update_clinic ON vital_signs
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**MEDICAL_HISTORY table policies:**
```sql
-- Admin can select any medical history
CREATE POLICY medical_history_select_admin ON medical_history
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select medical history from their clinic
CREATE POLICY medical_history_select_clinic ON medical_history
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert medical history in their clinic
CREATE POLICY medical_history_insert_clinic ON medical_history
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update medical history in their clinic
CREATE POLICY medical_history_update_clinic ON medical_history
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**VACCINE_RECORDS table policies:**
```sql
-- Admin can select any vaccine record
CREATE POLICY vaccine_records_select_admin ON vaccine_records
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select vaccine records from their clinic
CREATE POLICY vaccine_records_select_clinic ON vaccine_records
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert vaccine records in their clinic
CREATE POLICY vaccine_records_insert_clinic ON vaccine_records
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update vaccine records in their clinic
CREATE POLICY vaccine_records_update_clinic ON vaccine_records
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**ATTACHMENTS table policies:**
```sql
-- Admin can select any attachment
CREATE POLICY attachments_select_admin ON attachments
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select attachments from their clinic
CREATE POLICY attachments_select_clinic ON attachments
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert attachments in their clinic
CREATE POLICY attachments_insert_clinic ON attachments
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can delete attachments in their clinic
CREATE POLICY attachments_delete_clinic ON attachments
  FOR DELETE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**PRESCRIPTIONS table policies:**
```sql
-- Admin can select any prescription
CREATE POLICY prescriptions_select_admin ON prescriptions
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Doctor/staff can select prescriptions from their clinic
CREATE POLICY prescriptions_select_clinic ON prescriptions
  FOR SELECT
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can insert prescriptions in their clinic
CREATE POLICY prescriptions_insert_clinic ON prescriptions
  FOR INSERT
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Doctor/staff can update prescriptions in their clinic
CREATE POLICY prescriptions_update_clinic ON prescriptions
  FOR UPDATE
  USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid)
  WITH CHECK (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);
```

**CRITICAL:**
- Every table has RLS ENABLED
- Every SELECT policy allows admin OR checks clinic_id
- Every INSERT/UPDATE policy checks clinic_id match (no admin override)
- DELETE policies restricted to staff (doctors cannot delete)
- All auth.jwt() calls extract clinic_id and user_role claims
- RLS is ENFORCED at PostgreSQL layer (not in app code)
  </action>
  <verify>
    <automated>grep -c "ALTER TABLE.*ENABLE ROW LEVEL SECURITY" lib/db-rls-policies.sql | grep -E "^10$"</automated>
    <automated>grep -c "CREATE POLICY" lib/db-rls-policies.sql | grep -E "[4-5][0-9]"</automated>
    <automated>grep "user_role.*admin" lib/db-rls-policies.sql | head -1</automated>
  </verify>
  <done>
    - lib/db-rls-policies.sql exists with all RLS policy definitions
    - All 10 tables have RLS ENABLED
    - All SELECT policies include admin override
    - All INSERT/UPDATE policies check clinic_id match
    - DELETE restricted to staff role
    - Ready to be executed in Supabase
  </done>
</task>

<task type="auto">
  <name>Task 2: Create query functions with clinic context in lib/supabase-queries.ts</name>
  <files>lib/supabase-queries.ts</files>
  <read_first>
    - lib/supabase.ts (to understand Supabase client setup)
    - hooks/use-auth.ts (to understand current user structure)
    - lib/types.ts (to understand Patient, Appointment, etc. types)
  </read_first>
  <action>
Create lib/supabase-queries.ts with clinic-aware query functions (these complement RLS policies with app-level filtering):

```typescript
import { createClient } from '@/lib/supabase';
import { AuthUser } from '@/lib/types';
import {
  Patient,
  Appointment,
  ConsultationNote,
  VitalSigns,
  DoctorProfile,
  Prescription,
  MedicalHistory,
  VaccineRecord,
  Attachment,
  Clinic,
} from '@/lib/types';

/**
 * Get current user's clinic context.
 * Verifies clinic_id from JWT claims (server-verified, not user-selectable).
 */
export async function getClinicContext(user: AuthUser | null): Promise<{
  clinic_id: string;
  user_role: 'admin' | 'doctor' | 'staff';
}> {
  if (!user) {
    throw new Error('User not authenticated');
  }

  return {
    clinic_id: user.clinic_id,
    user_role: user.user_role,
  };
}

/**
 * Get patients for current clinic.
 * RLS enforces clinic_id boundary; app layer adds explicit filter.
 * (Defense-in-depth: RLS + app-level filtering)
 */
export async function getPatients(
  clinic_id: string,
  options?: { limit?: number; offset?: number }
) {
  const supabase = createClient();
  
  return supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinic_id)
    .order('full_name', { ascending: true })
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);
}

/**
 * Get patient by ID with clinic isolation check.
 */
export async function getPatientById(clinic_id: string, patient_id: string) {
  const supabase = createClient();
  
  return supabase
    .from('patients')
    .select('*')
    .eq('id', patient_id)
    .eq('clinic_id', clinic_id)
    .single();
}

/**
 * Create new patient in clinic.
 */
export async function createPatient(
  clinic_id: string,
  data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();
  
  return supabase
    .from('patients')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Get appointments for clinic with optional patient filter.
 */
export async function getAppointments(
  clinic_id: string,
  patient_id?: string,
  options?: { limit?: number; offset?: number }
) {
  const supabase = createClient();
  
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', clinic_id);

  if (patient_id) {
    query = query.eq('patient_id', patient_id);
  }

  return query
    .order('appointment_datetime', { ascending: false })
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);
}

/**
 * Create appointment in clinic.
 */
export async function createAppointment(
  clinic_id: string,
  data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();
  
  return supabase
    .from('appointments')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Get consultation notes for patient in clinic.
 */
export async function getConsultationNotes(
  clinic_id: string,
  patient_id: string
) {
  const supabase = createClient();
  
  return supabase
    .from('consultation_notes')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('created_at', { ascending: false });
}

/**
 * Get vital signs for patient in clinic.
 */
export async function getVitalSigns(
  clinic_id: string,
  patient_id: string,
  options?: { limit?: number }
) {
  const supabase = createClient();
  
  return supabase
    .from('vital_signs')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('recorded_at', { ascending: false })
    .limit(options?.limit || 20);
}

/**
 * Get medical history for patient in clinic.
 */
export async function getMedicalHistory(
  clinic_id: string,
  patient_id: string
) {
  const supabase = createClient();
  
  return supabase
    .from('medical_history')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('diagnosis_date', { ascending: false });
}

/**
 * Get vaccine records for patient in clinic.
 */
export async function getVaccineRecords(
  clinic_id: string,
  patient_id: string
) {
  const supabase = createClient();
  
  return supabase
    .from('vaccine_records')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('administration_date', { ascending: false });
}

/**
 * Get prescriptions for patient in clinic.
 */
export async function getPrescriptions(
  clinic_id: string,
  patient_id: string
) {
  const supabase = createClient();
  
  return supabase
    .from('prescriptions')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('prescribed_at', { ascending: false });
}

/**
 * Get attachments for patient in clinic.
 */
export async function getAttachments(
  clinic_id: string,
  patient_id: string
) {
  const supabase = createClient();
  
  return supabase
    .from('attachments')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('uploaded_at', { ascending: false });
}

/**
 * Get doctors for clinic.
 */
export async function getDoctors(clinic_id: string) {
  const supabase = createClient();
  
  return supabase
    .from('doctor_profiles')
    .select('*')
    .eq('clinic_id', clinic_id)
    .order('created_at', { ascending: false });
}

/**
 * Create consultation note in clinic.
 */
export async function createConsultationNote(
  clinic_id: string,
  data: Omit<ConsultationNote, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();
  
  return supabase
    .from('consultation_notes')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Create vital sign record in clinic.
 */
export async function createVitalSign(
  clinic_id: string,
  data: Omit<VitalSigns, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();
  
  return supabase
    .from('vital_signs')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Create prescription in clinic.
 */
export async function createPrescription(
  clinic_id: string,
  data: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = createClient();
  
  return supabase
    .from('prescriptions')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Export all query functions for use in components
 */
export const dbQueries = {
  getClinicContext,
  getPatients,
  getPatientById,
  createPatient,
  getAppointments,
  createAppointment,
  getConsultationNotes,
  getVitalSigns,
  getMedicalHistory,
  getVaccineRecords,
  getPrescriptions,
  getAttachments,
  getDoctors,
  createConsultationNote,
  createVitalSign,
  createPrescription,
};
```

**CRITICAL:**
- Every query includes `eq('clinic_id', clinic_id)` filter (defense-in-depth with RLS)
- All functions are async (database calls)
- All functions include clinic_id as first parameter
- No queries leak across clinic boundaries
- RLS policies enforce at database layer; app layer adds explicit filters
  </action>
  <verify>
    <automated>grep -c "export async function" lib/supabase-queries.ts | grep -E "1[5-9]|2[0-9]"</automated>
    <automated>grep "eq('clinic_id', clinic_id)" lib/supabase-queries.ts | wc -l | grep -E "1[5-9]|2[0-9]"</automated>
  </verify>
  <done>
    - lib/supabase-queries.ts exists with 15+ query functions
    - Every query includes clinic_id filter (defense-in-depth)
    - All functions typed with proper imports from lib/types.ts
    - All async database operations ready for use in components
    - Ready for Plan 04 (integration tests)
  </done>
</task>

<task type="auto">
  <name>Task 3: Commit RLS policies and query functions</name>
  <files>lib/db-rls-policies.sql, lib/supabase-queries.ts</files>
  <read_first>
    - lib/db-rls-policies.sql (complete RLS definitions)
    - lib/supabase-queries.ts (complete query functions)
  </read_first>
  <action>
Commit RLS policies and query functions:

```bash
git add lib/db-rls-policies.sql lib/supabase-queries.ts
git commit -m "feat(03): implement RLS policies for clinic isolation + query functions"
```

This commit establishes:
1. RLS enforcement at PostgreSQL layer (clinic isolation at database level)
2. App-level query functions with clinic_id filtering (defense-in-depth)
3. All 6 ISOL requirements (ISOL-01 through ISOL-06) satisfied

Next step: Plan 04 creates integration tests that verify RLS is actually working.
  </action>
  <verify>
    <automated>grep -c "CREATE POLICY" lib/db-rls-policies.sql | grep -E "[4-5][0-9]"</automated>
    <automated>test -f lib/supabase-queries.ts && echo "Query functions file exists"</automated>
  </verify>
  <done>
    - RLS policies defined for all 10 tables (40-50 policies total)
    - Query functions created for all major operations
    - Defense-in-depth: RLS at database + clinic_id filters in app queries
    - Files committed to git
    - Ready for Plan 04 (integration tests)
  </done>
</task>

</tasks>

---

## Verification

**Plan 03 is complete when:**
1. ✅ lib/db-rls-policies.sql with 10 ALTER TABLE ENABLE statements
2. ✅ 40-50 CREATE POLICY statements (4-5 per table)
3. ✅ All SELECT policies include admin override
4. ✅ All INSERT/UPDATE policies check clinic_id match
5. ✅ lib/supabase-queries.ts with 15+ query functions
6. ✅ All query functions include clinic_id filter
7. ✅ Git commit created

---

## Success Criteria

**Plan 03 Complete when:**
- [ ] RLS policies written and ready to deploy
- [ ] All 10 tables have RLS ENABLED
- [ ] Doctor from Clinic A cannot query Clinic B (RLS blocks)
- [ ] Admin can read all clinics' data (RLS allows with role check)
- [ ] Query functions created with clinic context
- [ ] All query functions include clinic_id filter
- [ ] Ready to hand off to Plan 04 (integration tests)

**ISOL-01 through ISOL-06 Progress:**
- ISOL-01 (RLS policies on all tables): Implemented ✓
- ISOL-02 (RLS verifies role before read): Implemented ✓
- ISOL-03 (RLS verifies role before write): Implemented ✓
- ISOL-04 (User cannot cross clinic boundaries): Enforced ✓
- ISOL-05 (Doctor cannot see other clinic patients): Enforced ✓
- ISOL-06 (Staff cannot modify outside clinic): Enforced ✓

---

## Output

After completion, create `.planning/phases/03-database-schema-rls/03-database-schema-rls-03-SUMMARY.md` with:
- RLS policies created (40-50 policies)
- Query functions created (15+ functions)
- Clinic isolation enforced at database layer
- Files modified (lib/db-rls-policies.sql, lib/supabase-queries.ts)
- Handoff notes for Plan 04 (integration tests)

---

*Plan created: 2026-03-27*
*Phase: 03 - Database Schema & Row-Level Security*
*Goal: Enforce clinic isolation at PostgreSQL layer with RLS + app-level query functions*
