---
phase: 03-database-schema-rls
plan: 02
type: execute
wave: 1
depends_on: []
files_modified: [
  "lib/db-schema.sql",
  "package.json"
]
autonomous: true
requirements: [DATA-06, DATA-07, DATA-08, DATA-09, DATA-10]
user_setup: []

must_haves:
  truths:
    - "All 5 data tables exist in Supabase with proper column definitions"
    - "Every data table has clinic_id column (not nullable) and indexed"
    - "Vital signs, medical history, vaccines, attachments link to patients with clinic isolation"
    - "Prescriptions table tracks clinic context and patient relationships"
  artifacts:
    - path: "lib/db-schema.sql"
      provides: "DDL additions for: vital_signs, medical_history, vaccine_records, attachments, prescriptions"
      min_lines: 350
    - path: ".env.local.example"
      provides: "Supabase connection variables (from Plan 01)"
      contains: ["NEXT_PUBLIC_SUPABASE_URL"]
  key_links:
    - from: "lib/db-schema.sql"
      to: "Supabase PostgreSQL"
      via: "SQL execution"
      pattern: "CREATE TABLE.*(vital_signs|medical_history|vaccine_records|attachments|prescriptions)"
    - from: "vital_signs"
      to: "patients"
      via: "patient_id FK with clinic_id check"
      pattern: "patient_id UUID NOT NULL REFERENCES patients"
---

# Plan 2: Data Tables Schema

Create remaining Supabase PostgreSQL tables for vital signs, medical history, vaccine records, attachments, and prescriptions. These tables store patient medical data with clinic isolation enforced at the database layer.

**Goal:** All 5 data entity tables exist with clinic_id isolation, indexed for performance, and linked to patients.

**Depends on:** Plan 01 (core tables must exist first for foreign key references)

**Not in this plan:** RLS policies (Plan 03), integration tests (Plan 04)

---

## Context

### From Plan 01
- Core tables created: clinics, patients, doctor_profiles, appointments, consultation_notes
- All use clinic_id NOT NULL for isolation
- All foreign keys properly indexed

### This Plan
Data tables (vital signs, medical history, vaccines, attachments, prescriptions) that extend patient records. Each is clinic-isolated via patient FK + explicit clinic_id column.

---

## Tasks

<task type="auto">
  <name>Task 1: Add data table definitions to lib/db-schema.sql</name>
  <files>lib/db-schema.sql</files>
  <read_first>
    - lib/db-schema.sql (to append definitions, not overwrite)
    - lib/types.ts (to understand VitalSigns, MedicalHistory, Vaccine shape)
  </read_first>
  <action>
Append the following table definitions to lib/db-schema.sql (at the end of the file, after the 5 core tables):

**6. vital_signs table:**
```sql
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  temperature_celsius DECIMAL(5, 2),
  systolic_pressure INTEGER,
  diastolic_pressure INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation_percent DECIMAL(5, 2),
  weight_kg DECIMAL(6, 2),
  height_cm DECIMAL(6, 2),
  blood_glucose_mg_dl DECIMAL(6, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vital_signs_clinic_id ON vital_signs(clinic_id);
CREATE INDEX idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX idx_vital_signs_recorded_at ON vital_signs(recorded_at);
```

**7. medical_history table:**
```sql
CREATE TABLE IF NOT EXISTS medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_name VARCHAR(255) NOT NULL,
  diagnosis_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  severity VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_history_clinic_id ON medical_history(clinic_id);
CREATE INDEX idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX idx_medical_history_status ON medical_history(status);
```

**8. vaccine_records table:**
```sql
CREATE TABLE IF NOT EXISTS vaccine_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(255) NOT NULL,
  dose_number INTEGER,
  administration_date DATE NOT NULL,
  lot_number VARCHAR(100),
  route_of_administration VARCHAR(100),
  site_of_injection VARCHAR(100),
  administered_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vaccine_records_clinic_id ON vaccine_records(clinic_id);
CREATE INDEX idx_vaccine_records_patient_id ON vaccine_records(patient_id);
CREATE INDEX idx_vaccine_records_vaccine_name ON vaccine_records(vaccine_name);
CREATE INDEX idx_vaccine_records_admin_date ON vaccine_records(administration_date);
```

**9. attachments table:**
```sql
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size_bytes INTEGER,
  file_mime_type VARCHAR(100),
  uploaded_by_doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE SET NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_clinic_id ON attachments(clinic_id);
CREATE INDEX idx_attachments_patient_id ON attachments(patient_id);
CREATE INDEX idx_attachments_document_type ON attachments(document_type);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by_doctor_id);
```

**10. prescriptions table:**
```sql
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE SET NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage_amount DECIMAL(10, 2),
  dosage_unit VARCHAR(50),
  frequency VARCHAR(100),
  duration_days INTEGER,
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'active',
  prescribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_clinic_id ON prescriptions(clinic_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_medication ON prescriptions(medication_name);
```

**CRITICAL:**
- Every table includes clinic_id NOT NULL as first FK column (after id)
- Every table has patient_id FK to patients(id)
- clinic_id is redundant but REQUIRED for RLS enforcement (see Plan 03)
- All timestamps are TIMESTAMP WITH TIME ZONE
- All indexes follow naming pattern idx_{table}_{column}
- No RLS policies in this file (added in Plan 03)

**Append, don't replace:** Add these 5 tables to the end of the existing lib/db-schema.sql (which already has 5 core tables).
  </action>
  <verify>
    <automated>grep -c "CREATE TABLE" lib/db-schema.sql | grep -E "^10$"</automated>
    <automated>grep -c "clinic_id UUID NOT NULL" lib/db-schema.sql | grep -E "^9$"</automated>
    <automated>grep "CREATE TABLE IF NOT EXISTS vital_signs" lib/db-schema.sql</automated>
  </verify>
  <done>
    - lib/db-schema.sql has 10 total CREATE TABLE statements (5 from Plan 01 + 5 from this plan)
    - All data tables include clinic_id column (NOT NULL, indexed)
    - All data tables link to patients via patient_id FK
    - All 50 indexes created (50 = 10 tables × 5 avg indexes each)
    - No RLS policies included (deferred to Plan 03)
    - File ready to be executed in Supabase
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify expanded schema and commit</name>
  <files>lib/db-schema.sql</files>
  <read_first>
    - lib/db-schema.sql (complete file with all 10 tables)
  </read_first>
  <action>
Validate the expanded schema:

1. Count all CREATE TABLE statements (should be 10):
   ```bash
   grep -c "CREATE TABLE" lib/db-schema.sql  # Output: 10
   ```

2. Count all CREATE INDEX statements (should be ~45-50):
   ```bash
   grep -c "CREATE INDEX" lib/db-schema.sql  # Output: 45-50
   ```

3. Verify all clinic_id columns are NOT NULL (should be 9 non-clinics tables):
   ```bash
   grep -c "clinic_id UUID NOT NULL" lib/db-schema.sql  # Output: 9
   ```

4. Verify patient_id references (should be in vital_signs, medical_history, vaccine_records, attachments, prescriptions):
   ```bash
   grep "patient_id UUID NOT NULL REFERENCES patients" lib/db-schema.sql | wc -l  # Output: 5
   ```

5. Commit the changes:
   ```bash
   git add lib/db-schema.sql
   git commit -m "schema(03): add data tables (vital_signs, medical_history, vaccines, attachments, prescriptions)"
   ```

This establishes the complete data layer schema. Plan 03 will add RLS policies to enforce clinic isolation at the database level.
  </action>
  <verify>
    <automated>test -f lib/db-schema.sql && wc -l lib/db-schema.sql | grep -oE "^[[:space:]]*[0-9]+" | grep -E "[3-5][0-9]{2}"</automated>
    <automated>grep "CREATE TABLE IF NOT EXISTS prescriptions" lib/db-schema.sql</automated>
  </verify>
  <done>
    - All 10 tables defined (5 core + 5 data)
    - All data tables have clinic_id NOT NULL and patient_id FK
    - All indexes created for performance
    - Schema file committed with clear message
    - Ready for Plan 03 (RLS policies)
  </done>
</task>

</tasks>

---

## Verification

**Plan 02 is complete when:**
1. ✅ lib/db-schema.sql now contains 10 CREATE TABLE statements
2. ✅ All data tables include clinic_id (NOT NULL, indexed)
3. ✅ All data tables link to patients via FK
4. ✅ ~45-50 indexes created across all tables
5. ✅ Git commit created with message about data tables

---

## Success Criteria

**Plan 02 Complete when:**
- [ ] Data table definitions added to lib/db-schema.sql
- [ ] All 5 data tables defined: vital_signs, medical_history, vaccine_records, attachments, prescriptions
- [ ] clinic_id isolation on all data tables
- [ ] Patient relationships properly defined via foreign keys
- [ ] All indexes created for query performance
- [ ] Ready to hand off to Plan 03 (RLS policies)

**DATA-06 through DATA-10 Progress:**
- DATA-06 (Vital signs persist): Schema defined ✓ (clinic isolation + tests in Plan 04)
- DATA-07 (Medical history persists): Schema defined ✓
- DATA-08 (Vaccine records persist): Schema defined ✓
- DATA-09 (Attachments persist): Schema defined ✓ (clinic isolation + tests in Plan 04)
- DATA-10 (Prescriptions persist): Schema defined ✓

---

## Output

After completion, create `.planning/phases/03-database-schema-rls/03-database-schema-rls-02-SUMMARY.md` with:
- Data tables created (5 tables)
- clinic_id isolation confirmed
- Files modified (lib/db-schema.sql)
- Handoff notes for Plan 03 (RLS policies)

---

*Plan created: 2026-03-27*
*Phase: 03 - Database Schema & Row-Level Security*
*Goal: Complete schema with all core and data entities*
