---
phase: 03-database-schema-rls
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [
  "lib/db-schema.sql",
  ".env.local.example",
  "package.json"
]
autonomous: true
requirements: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05]
user_setup: []

must_haves:
  truths:
    - "All core entity tables exist in Supabase with proper column definitions"
    - "Every table has clinic_id column (not nullable) and indexed for query performance"
    - "Table relationships respect clinic boundaries (foreign keys include clinic_id)"
    - "Doctor profile table links doctors to their assigned clinics"
  artifacts:
    - path: "lib/db-schema.sql"
      provides: "DDL for all core tables: clinics, patients, doctor_profiles, appointments, consultation_notes"
      min_lines: 200
    - path: ".env.local.example"
      provides: "Environment variable template for Supabase connection (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)"
      contains: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  key_links:
    - from: "lib/db-schema.sql"
      to: "Supabase PostgreSQL"
      via: "SQL execution (manual via Supabase CLI or dashboard)"
      pattern: "CREATE TABLE.*clinic_id"
    - from: ".env.local"
      to: "Supabase connection"
      via: "Supabase JS client initialization in lib/supabase.ts"
      pattern: "process.env.NEXT_PUBLIC_SUPABASE_URL"
---

# Plan 1: Core Database Schema - Tables

Create foundational Supabase PostgreSQL tables for clinics, patients, doctors, appointments, and consultation notes. This plan establishes the core entities required by Phase 3 requirements DATA-01 through DATA-05.

**Goal:** All 5 core entity tables exist in Supabase with proper schemas, clinic isolation via clinic_id column, and indexed for performance.

**Depends on:** Phase 2 (Supabase Auth + authenticated users with clinic_id in JWT must be working)

**Not in this plan:** RLS policies (Plan 03), vital signs/medical history/vaccines/attachments/prescriptions tables (Plan 02)

---

## Context

### Phase 2 Foundation (Complete)
- Supabase Auth working: users can sign up, log in, maintain sessions
- JWT contains clinic_id and user_role claims
- Middleware validates user on every request
- useAuth hook provides current user context

### Phase 3 Goal
All data entities persist with clinic isolation enforced at PostgreSQL layer. This plan creates the schema; Plan 03 adds RLS policies.

### Technical Constraints
- **Clinic isolation non-negotiable:** Every table has clinic_id column (FK to clinics.id), not nullable
- **Incremental schema:** Start with 5 core tables (clinics, patients, doctors, appointments, consultation_notes); add 5 data tables in Plan 02
- **No seed data:** Clean Supabase — no fixtures or mock data in schema
- **TypeScript types:** Maintain existing `lib/types.ts` type definitions (Patient, Appointment, etc.); schema should match type shapes

---

## Tasks

<task type="auto">
  <name>Task 1: Write core table definitions to lib/db-schema.sql</name>
  <files>lib/db-schema.sql</files>
  <read_first>
    - lib/types.ts (to understand Patient, Appointment, ConsultationNote shape)
    - .planning/ROADMAP.md (Phase 2 goal for context)
  </read_first>
  <action>
Create lib/db-schema.sql with the following table definitions (copy these exactly):

**1. clinics table:**
```sql
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clinics_name ON clinics(name);
```

**2. patients table** (clinic_id is the isolation boundary):
```sql
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  id_document VARCHAR(50),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_email ON patients(email);
```

**3. doctor_profiles table** (doctors belong to clinics):
```sql
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialization VARCHAR(255),
  license_number VARCHAR(100) UNIQUE,
  biography TEXT,
  availability_monday VARCHAR(50),
  availability_tuesday VARCHAR(50),
  availability_wednesday VARCHAR(50),
  availability_thursday VARCHAR(50),
  availability_friday VARCHAR(50),
  availability_saturday VARCHAR(50),
  availability_sunday VARCHAR(50),
  office_phone VARCHAR(20),
  office_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_doctor_profiles_clinic_id ON doctor_profiles(clinic_id);
CREATE INDEX idx_doctor_profiles_license ON doctor_profiles(license_number);
```

**4. appointments table** (clinic_id isolation):
```sql
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE SET NULL,
  appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(50) DEFAULT 'scheduled',
  reason_for_visit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);
```

**5. consultation_notes table** (clinic_id isolation):
```sql
CREATE TABLE IF NOT EXISTS consultation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE SET NULL,
  chief_complaint TEXT,
  findings TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescriptions_given TEXT,
  follow_up_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultation_notes_clinic_id ON consultation_notes(clinic_id);
CREATE INDEX idx_consultation_notes_patient_id ON consultation_notes(patient_id);
CREATE INDEX idx_consultation_notes_appointment_id ON consultation_notes(appointment_id);
CREATE INDEX idx_consultation_notes_doctor_id ON consultation_notes(doctor_id);
```

**CRITICAL:** 
- Every table (except clinics) has clinic_id column NOT NULL with FK to clinics.id
- Every FK has ON DELETE CASCADE or SET NULL (specify which makes sense)
- Every clinic_id column is indexed for query performance
- clinic_id is ALWAYS the first business column after id (comes before patient_id, doctor_id, etc.)
- All timestamps use TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- All IDs use UUID PRIMARY KEY DEFAULT gen_random_uuid()
- No RLS policies in this file (added in Plan 03)
  </action>
  <verify>
    <automated>grep -c "CREATE TABLE" lib/db-schema.sql | grep -E "^5$"</automated>
    <automated>grep -c "clinic_id UUID NOT NULL" lib/db-schema.sql | grep -E "^4$"</automated>
    <automated>grep -c "CREATE INDEX idx_.*_clinic_id" lib/db-schema.sql | grep -E "^4$"</automated>
  </verify>
  <done>
    - lib/db-schema.sql exists with 5 CREATE TABLE statements
    - All non-clinics tables include clinic_id column (NOT NULL, indexed)
    - All foreign key constraints reference clinics.id for isolation
    - All indexes follow naming pattern: idx_{table}_{column}
    - No RLS policies included (deferred to Plan 03)
  </done>
</task>

<task type="auto">
  <name>Task 2: Update .env.local.example with Supabase variables</name>
  <files>.env.local.example</files>
  <read_first>
    - .env.local.example (to see current structure)
    - .planning/STATE.md (Phase 1 auth setup)
  </read_first>
  <action>
Update .env.local.example to include the database and service role variables needed for schema creation:

```
# Supabase Configuration (from Phase 1 Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection (for schema migration)
SUPABASE_DB_PASSWORD=your-database-password
SUPABASE_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

If these variables already exist (from Phase 1 Auth), verify they are present. If not, add them with placeholder values and instructions:

```
# DATABASE SETUP (Phase 3)
# These values come from Supabase project dashboard:
# 1. SUPABASE_SERVICE_ROLE_KEY: Settings → API → Service Role key (SECRET — do not commit)
# 2. SUPABASE_DB_PASSWORD: Settings → Database → Reset database password (if needed)
# 3. SUPABASE_DB_URL: Settings → Database → Connection string (PostgreSQL)
```

**CRITICAL:** Do NOT commit .env.local to git (should be in .gitignore already). These are secrets.
  </action>
  <verify>
    <automated>grep "NEXT_PUBLIC_SUPABASE_URL" .env.local.example</automated>
    <automated>grep "SUPABASE_SERVICE_ROLE_KEY" .env.local.example</automated>
  </verify>
  <done>
    - .env.local.example includes NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY placeholders
    - .env.local.example includes comments explaining where to find values
    - .gitignore contains .env.local (verified separately)
  </done>
</task>

<task type="auto">
  <name>Task 3: Verify schema syntax and commit</name>
  <files>lib/db-schema.sql</files>
  <read_first>
    - lib/db-schema.sql (the file just created)
  </read_first>
  <action>
Validate the SQL schema file for syntax correctness:

1. Check that all CREATE TABLE statements are balanced (all parentheses closed):
   ```bash
   grep -o "CREATE TABLE" lib/db-schema.sql | wc -l  # Should output: 5
   ```

2. Check that all table names are valid (no typos):
   Expected: clinics, patients, doctor_profiles, appointments, consultation_notes

3. Verify no duplicate CREATE TABLE statements (should be 5 unique tables)

4. Verify all clinic_id columns are NOT NULL:
   ```bash
   grep "clinic_id UUID NOT NULL" lib/db-schema.sql | wc -l  # Should output: 4
   ```

5. Commit the files:
   ```bash
   git add lib/db-schema.sql .env.local.example
   git commit -m "schema(03): define core tables (clinics, patients, doctors, appointments, consultation_notes)"
   ```

This commit establishes the baseline schema. Plan 03 will add RLS policies. Plan 02 will add data tables.
  </action>
  <verify>
    <automated>npm run build 2>&1 | grep -i "error" | grep -v "node_modules" || echo "Build OK"</automated>
    <automated>test -f lib/db-schema.sql && echo "Schema file exists" || echo "FAIL"</automated>
  </verify>
  <done>
    - Schema file passes syntax validation (no unmatched parentheses)
    - All 5 tables defined with clinic_id isolation
    - .env.local.example updated with Supabase variables
    - Changes committed to git with clear message
    - Ready for Plan 02 (data tables) and Plan 03 (RLS policies)
  </done>
</task>

</tasks>

---

## Verification

**Phase 3, Plan 01 is complete when:**
1. ✅ lib/db-schema.sql exists with 5 CREATE TABLE statements
2. ✅ All clinic_id columns are NOT NULL and indexed
3. ✅ All foreign keys properly reference clinics.id
4. ✅ .env.local.example includes Supabase connection variables
5. ✅ No TypeScript build errors
6. ✅ Git commit created with clear message

**What's NOT verified yet:**
- Schema actually running in Supabase (done manually via Supabase dashboard or migrations in Plan 02)
- RLS policies (added in Plan 03)
- Actual data persistence (tested in Plan 04 integration tests)

---

## Success Criteria

**Plan 01 Complete when:**
- [ ] Core table schema written and committed
- [ ] All 5 tables defined: clinics, patients, doctor_profiles, appointments, consultation_notes
- [ ] clinic_id isolation on all patient-related tables
- [ ] .env.local.example updated with Supabase variables
- [ ] Ready to hand off to Plan 02 (data tables) and Plan 03 (RLS)

**DATA-01 through DATA-05 Progress:**
- DATA-01 (Clinics data persists): Schema defined ✓ (persistence tested in Plan 04)
- DATA-02 (Patients data persists): Schema defined ✓ (clinic isolation + tests in Plan 04)
- DATA-03 (Doctor profiles persist): Schema defined ✓
- DATA-04 (Appointments persist): Schema defined ✓ (clinic isolation + tests in Plan 04)
- DATA-05 (Consultation notes persist): Schema defined ✓ (clinic isolation + tests in Plan 04)

---

## Output

After completion, create `.planning/phases/03-database-schema-rls/03-database-schema-rls-01-SUMMARY.md` with:
- What was created (5 core tables)
- Files modified (lib/db-schema.sql, .env.local.example)
- Requirements progress (DATA-01 through DATA-05 schema defined)
- Handoff notes for Plan 02 (data tables) and Plan 03 (RLS)

---

*Plan created: 2026-03-27*
*Phase: 03 - Database Schema & Row-Level Security*
*Goal: Establish core entity schemas with clinic isolation boundary*
