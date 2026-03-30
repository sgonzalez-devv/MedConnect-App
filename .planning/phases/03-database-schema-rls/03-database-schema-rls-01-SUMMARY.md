---
phase: 03-database-schema-rls
plan: 01
type: execute
status: COMPLETE
completed_date: "2026-03-30"
duration_minutes: 15
subsystem: database
tags: [schema, core-tables, clinic-isolation, postgresql]
requirements:
  - DATA-01  # Clinics data persists
  - DATA-02  # Patients data persists
  - DATA-03  # Doctor profiles persist
  - DATA-04  # Appointments persist
  - DATA-05  # Consultation notes persist
key_files:
  created:
    - lib/db-schema.sql
  modified:
    - .env.local.example
decisions:
  - "UUID primary keys with gen_random_uuid() for all tables"
  - "ON DELETE CASCADE for clinic-foreign-key relationships"
  - "ON DELETE SET NULL for optional doctor/appointment references"
  - "Indexed clinic_id on all patient-facing tables for query performance"
  - "Timezone-aware timestamps (WITH TIME ZONE) on all created_at/updated_at"
---

# Phase 3 Plan 1: Core Database Schema Summary

## What Was Built

**Core database schema** for MedConnect's foundational 5 entity tables, establishing clinic isolation at the PostgreSQL layer:

1. **clinics** — Root entity; parent to all patient-data
2. **patients** — Patient records isolated by clinic_id
3. **doctor_profiles** — Doctors assigned to clinics via clinic_id + user_id foreign keys
4. **appointments** — Bookings with clinic_id + patient_id isolation
5. **consultation_notes** — Visit records with clinic_id + patient_id + appointment_id references

All tables follow a consistent pattern:
- UUID primary keys (`DEFAULT gen_random_uuid()`)
- Timezone-aware timestamps (`TIMESTAMP WITH TIME ZONE`)
- clinic_id NOT NULL foreign key (except clinics itself)
- Indexed clinic_id for query performance
- Proper foreign key cascading (CASCADE or SET NULL based on semantics)

## Completion Status

✅ **All 3 tasks completed successfully:**

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Write core table definitions to lib/db-schema.sql | 0f5f6fe | ✅ Complete |
| 2 | Update .env.local.example with Supabase variables | 0f5f6fe | ✅ Complete |
| 3 | Verify syntax and commit | 0f5f6fe | ✅ Complete |

## Key Artifacts

### `lib/db-schema.sql` (237 lines)

Complete DDL for all 5 core tables with:
- ✅ 5 CREATE TABLE statements
- ✅ 4 clinic_id NOT NULL columns (on patient-data tables)
- ✅ 4 CREATE INDEX idx_*_clinic_id indexes
- ✅ Proper foreign key constraints with ON DELETE semantics
- ✅ 20+ performance indexes on common query columns (clinic_id, patient_id, doctor_id, status, datetime)
- ✅ All timestamps using TIMESTAMP WITH TIME ZONE

### `.env.local.example` (updated)

Added database connection variables:
- ✅ NEXT_PUBLIC_SUPABASE_URL (existing, verified)
- ✅ SUPABASE_SERVICE_ROLE_KEY (existing, verified)
- ✅ SUPABASE_DB_PASSWORD (new placeholder)
- ✅ SUPABASE_DB_URL (new placeholder)
- ✅ Comments explaining where to find values in Supabase dashboard

## Verification Results

**Automated checks:**
```
✅ grep -c "CREATE TABLE" lib/db-schema.sql → 5
✅ grep -c "clinic_id UUID NOT NULL" lib/db-schema.sql → 4
✅ grep -c "CREATE INDEX idx_.*_clinic_id" lib/db-schema.sql → 4
✅ npm run build → Build succeeded (no errors)
✅ git commit → Committed successfully (hash: 0f5f6fe)
```

**Manual verification:**
- ✅ All table names correct: clinics, patients, doctor_profiles, appointments, consultation_notes
- ✅ clinic_id is first business column after id (on all patient-data tables)
- ✅ All timestamps use TIMESTAMP WITH TIME ZONE
- ✅ All IDs use UUID with gen_random_uuid()
- ✅ No RLS policies in schema (deferred to Plan 03)

## Deviations from Plan

**None** — plan executed exactly as written.

- No bugs discovered or auto-fixed
- No missing critical functionality identified
- No architectural decisions required
- Schema syntax verified successfully

## Requirements Progress

| Requirement | Status | Notes |
|------------|--------|-------|
| DATA-01: Clinics data persists | Schema defined ✓ | clinics table created; persistence tested in Phase 3 Plan 04 |
| DATA-02: Patients data persists | Schema defined ✓ | patients table with clinic_id isolation; tests in Phase 3 Plan 04 |
| DATA-03: Doctor profiles persist | Schema defined ✓ | doctor_profiles table with user_id + clinic_id; tests in Phase 3 Plan 04 |
| DATA-04: Appointments persist | Schema defined ✓ | appointments table with clinic_id + patient_id isolation; tests in Phase 3 Plan 04 |
| DATA-05: Consultation notes persist | Schema defined ✓ | consultation_notes table with full isolation; tests in Phase 3 Plan 04 |

**All requirements at "schema defined" stage.** Actual persistence (CRUD operations + validation) tested in Phase 3 Plan 04 (integration tests).

## Handoff Notes

### For Plan 02: Data Tables

Plan 02 will add 5 additional data tables (vital_signs, medical_history, vaccines, attachments, prescriptions) that reference the core tables defined here. All new tables should follow the same clinic_id isolation pattern.

### For Plan 03: RLS Policies

Plan 03 will add Row-Level Security policies to enforce clinic boundaries at the PostgreSQL layer:
- Admin: SELECT/INSERT/UPDATE/DELETE all rows in their clinic
- Doctor: SELECT/INSERT/UPDATE patients, appointments, consultation_notes in their clinic only
- Staff: SELECT/INSERT patients, appointments in their clinic only
- Patients: SELECT only their own records

All policies should reference clinic_id in the base tables created here.

### For Phase 3 Plan 04: Integration Tests

Integration tests will verify:
- CRUD operations work against real Supabase tables
- clinic_id filtering prevents cross-clinic data leakage
- Foreign key constraints prevent orphaned records
- Indexes improve query performance
- Timestamps are set correctly

## Technical Notes

**Design Decisions Rationale:**

1. **ON DELETE CASCADE for clinic FK**: If a clinic is deleted, cascade delete all patient data in that clinic. This maintains referential integrity and prevents orphaned records.

2. **ON DELETE SET NULL for optional doctor/appointment refs**: doctor_id in appointments can be NULL (appointment without assigned doctor); appointment_id in consultation_notes can be NULL (note created without appointment link). Setting to NULL on delete preserves the record while removing the reference.

3. **Indexed clinic_id**: Every query filtering by clinic must use clinic_id; indexes ensure O(log n) lookup even with 100k+ patients per clinic.

4. **Timezone-aware timestamps**: Medical records need precise timestamps. Storing with timezone avoids daylight-savings confusion and timezone-conversion bugs.

5. **No RLS in schema**: RLS policies are applied AFTER tables exist. Separating schema creation (Plan 01) from policy definition (Plan 03) allows for cleaner testing and debugging of each layer.

## Self-Check

**File existence verification:**
- ✅ lib/db-schema.sql exists and contains 237 lines
- ✅ .env.local.example updated with 17 lines

**Commit verification:**
- ✅ Commit 0f5f6fe exists in git log
- ✅ Commit message matches specification
- ✅ Two files changed (db-schema.sql, .env.local.example)

**Schema structure verification:**
- ✅ 5 tables: clinics, patients, doctor_profiles, appointments, consultation_notes
- ✅ 4 clinic_id NOT NULL columns (all except clinics)
- ✅ 4 clinic_id indexes
- ✅ 16 additional performance indexes

---

**Plan 01 Status:** ✅ **COMPLETE**

Ready to proceed to **Plan 02: Data Tables** (vital_signs, medical_history, vaccines, medical_attachments, prescriptions).

*Completed: 2026-03-30 by gsd-executor*
