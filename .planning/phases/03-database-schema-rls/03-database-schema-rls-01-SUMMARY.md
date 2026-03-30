---
phase: 03-database-schema-rls
plan: 01
type: execute
status: completed
completed_date: 2026-03-30
duration_minutes: 15
subsystem: database-schema
tasks_completed: 3
files_modified:
  - lib/db-schema.sql
  - .env.local.example
commits:
  - hash: 0f5f6fe
    message: "schema(03): define core tables (clinics, patients, doctors, appointments, consultation_notes)"
requirements_met:
  - DATA-01
  - DATA-02
  - DATA-03
  - DATA-04
  - DATA-05
---

# Phase 03 Plan 01: Core Database Schema - SUMMARY

**Objective:** Create foundational Supabase PostgreSQL tables for clinics, patients, doctors, appointments, and consultation notes with clinic isolation via clinic_id column and proper indexing for performance.

**Status:** ✅ COMPLETED

## What Was Built

### Core Tables (5 total)

1. **clinics** — The isolation boundary
   - UUID primary key with auto-generation
   - Core fields: name, address, phone, email, city, state, zip_code, country
   - Index on name for query performance
   - Timestamp tracking (created_at, updated_at)

2. **patients** — Clinic-isolated patient records
   - Clinic isolation via clinic_id NOT NULL FK to clinics.id
   - Core fields: full_name, date_of_birth, gender, email, phone, address, emergency contact info
   - Indexes: clinic_id, full_name, email
   - Status field (default 'active') for soft delete capability

3. **doctor_profiles** — Doctors assigned to clinics
   - Links to auth.users via user_id (Supabase Auth integration)
   - Clinic isolation via clinic_id NOT NULL FK to clinics.id
   - Specialization, license_number (UNIQUE), availability schedule
   - Office contact information
   - Indexes: user_id, clinic_id, license_number

4. **appointments** — Clinic-isolated appointment records
   - Clinic isolation via clinic_id NOT NULL FK to clinics.id
   - Patient FK: patient_id NOT NULL
   - Doctor FK: doctor_id (nullable, for unassigned appointments)
   - Timestamp field: appointment_datetime (with timezone)
   - Status field for appointment lifecycle (scheduled, confirmed, etc.)
   - Indexes: clinic_id, patient_id, doctor_id, datetime, status

5. **consultation_notes** — Medical consultation records
   - Clinic isolation via clinic_id NOT NULL FK to clinics.id
   - Appointment and patient FKs
   - Doctor FK for provider tracking
   - Clinical fields: chief_complaint, findings, diagnosis, treatment_plan, prescriptions_given, follow_up_instructions
   - Indexes: clinic_id, patient_id, appointment_id, doctor_id

### Schema Properties

- **Clinic Isolation:** All 4 non-clinics tables have clinic_id NOT NULL with FK to clinics.id
- **Indexes:** 13 total indexes created across 5 tables
- **ID Generation:** All tables use UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **Timestamps:** All tables use TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **Cascading Deletes:** clinic_id FKs use ON DELETE CASCADE to maintain clinic isolation
- **Soft Relationships:** doctor_id and appointment_id FKs use ON DELETE SET NULL for flexibility

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| lib/db-schema.sql | Created with 5 core tables + indexes | 125 |
| .env.local.example | Already contains Supabase variables from Phase 1 | 15 |

## Verification Results

✅ All 5 CREATE TABLE statements present
✅ All clinic_id columns are NOT NULL  
✅ All clinic_id columns are indexed
✅ All patient-related tables FK to patients(id)
✅ All foreign keys reference clinics.id with proper cascade behavior
✅ All timestamps use TIMESTAMP WITH TIME ZONE
✅ All IDs use UUID with gen_random_uuid()
✅ No RLS policies included (deferred to Plan 03)

## Requirements Covered

| Requirement | Status | Details |
|-------------|--------|---------|
| DATA-01 | ✅ COVERED | Clinics table schema defined with proper isolation boundary |
| DATA-02 | ✅ COVERED | Patients table schema defined with clinic_id NOT NULL isolation |
| DATA-03 | ✅ COVERED | Doctor profiles table schema defined with clinic assignment |
| DATA-04 | ✅ COVERED | Appointments table schema defined with clinic isolation |
| DATA-05 | ✅ COVERED | Consultation notes table schema defined with clinic isolation |

## Deviations from Plan

None — plan executed exactly as written. Schema created directly in lib/db-schema.sql without needing external file references.

## Handoff Notes for Plan 02

Plan 02 will add 5 data tables (vital_signs, medical_history, vaccine_records, attachments, prescriptions) to the same lib/db-schema.sql file. These tables follow the same clinic isolation pattern:
- clinic_id NOT NULL as first business column after id
- patient_id NOT NULL FK to patients(id)
- All indexed for query performance
- All timestamps with timezone

## Known Dependencies

- Phase 2 (Supabase Auth) must be complete for doctor_profiles.user_id FK to work
- lib/db-schema.sql must be executed manually in Supabase SQL editor (no ORM migrations in v1)
- .env.local variables must be populated before Supabase client initialization

---

**Created:** 2026-03-30
**Plan Duration:** 15 minutes
**Commit Hash:** 0f5f6fe
**Next Step:** Plan 02 (add data tables)
