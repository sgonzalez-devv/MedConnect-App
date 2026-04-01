-- Migration 002: Fix RLS JWT Claims Path
-- Created: 2026-03-31
--
-- PROBLEM:
--   The original RLS policies read clinic_id and user_role from the TOP-LEVEL
--   of the JWT using  auth.jwt() ->> 'clinic_id'.
--
--   However, when you set user metadata via  auth.updateUser({ data: { clinic_id } })
--   Supabase stores it under the 'user_metadata' key in the JWT, NOT at the top level.
--   As a result, auth.jwt() ->> 'clinic_id'  always returns NULL, and every RLS
--   policy silently blocks all rows, causing empty responses (200 OK with data: []).
--
-- FIX:
--   Change every occurrence of:
--       auth.jwt() ->> 'clinic_id'
--   to:
--       COALESCE(
--         auth.jwt() -> 'user_metadata' ->> 'clinic_id',
--         auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
--       )
--
--   The COALESCE handles both metadata paths so it works whether clinic_id was
--   set via auth.updateUser (user_metadata) or the Admin API (app_metadata).
--
-- HOW TO RUN:
--   Paste this entire file into Supabase Dashboard > SQL Editor and execute.
--   Safe to re-run: uses DROP POLICY IF EXISTS before each CREATE POLICY.

BEGIN;

-- ============================================================================
-- Helper: reusable expressions
-- ============================================================================
-- clinic_id from JWT:
--   COALESCE(auth.jwt()->'user_metadata'->>'clinic_id', auth.jwt()->'app_metadata'->>'clinic_id')
--
-- user_role from JWT:
--   COALESCE(auth.jwt()->'user_metadata'->>'user_role', auth.jwt()->'app_metadata'->>'user_role')
-- ============================================================================


-- ============================================================================
-- CLINICS
-- ============================================================================
DROP POLICY IF EXISTS clinics_select_admin ON clinics;
DROP POLICY IF EXISTS clinics_select_user  ON clinics;

CREATE POLICY clinics_select_admin ON clinics
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY clinics_select_user ON clinics
  FOR SELECT
  USING (
    id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


-- ============================================================================
-- PATIENTS
-- ============================================================================
DROP POLICY IF EXISTS patients_select_admin  ON patients;
DROP POLICY IF EXISTS patients_select_clinic ON patients;
DROP POLICY IF EXISTS patients_insert_clinic ON patients;
DROP POLICY IF EXISTS patients_update_clinic ON patients;
DROP POLICY IF EXISTS patients_delete_staff  ON patients;

CREATE POLICY patients_select_admin ON patients
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY patients_select_clinic ON patients
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY patients_insert_clinic ON patients
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY patients_update_clinic ON patients
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY patients_delete_staff ON patients
  FOR DELETE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
    AND COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'staff'
  );


-- ============================================================================
-- DOCTOR_PROFILES
-- ============================================================================
DROP POLICY IF EXISTS doctor_profiles_select_admin  ON doctor_profiles;
DROP POLICY IF EXISTS doctor_profiles_select_clinic ON doctor_profiles;
DROP POLICY IF EXISTS doctor_profiles_insert_clinic ON doctor_profiles;
DROP POLICY IF EXISTS doctor_profiles_update_clinic ON doctor_profiles;

CREATE POLICY doctor_profiles_select_admin ON doctor_profiles
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY doctor_profiles_select_clinic ON doctor_profiles
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY doctor_profiles_insert_clinic ON doctor_profiles
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY doctor_profiles_update_clinic ON doctor_profiles
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


-- ============================================================================
-- APPOINTMENTS
-- ============================================================================
DROP POLICY IF EXISTS appointments_select_admin  ON appointments;
DROP POLICY IF EXISTS appointments_select_clinic ON appointments;
DROP POLICY IF EXISTS appointments_insert_clinic ON appointments;
DROP POLICY IF EXISTS appointments_update_clinic ON appointments;
DROP POLICY IF EXISTS appointments_delete_staff  ON appointments;

CREATE POLICY appointments_select_admin ON appointments
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY appointments_select_clinic ON appointments
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY appointments_insert_clinic ON appointments
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY appointments_update_clinic ON appointments
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY appointments_delete_staff ON appointments
  FOR DELETE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
    AND COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'staff'
  );


-- ============================================================================
-- CONSULTATION_NOTES
-- ============================================================================
DROP POLICY IF EXISTS consultation_notes_select_admin  ON consultation_notes;
DROP POLICY IF EXISTS consultation_notes_select_clinic ON consultation_notes;
DROP POLICY IF EXISTS consultation_notes_insert_clinic ON consultation_notes;
DROP POLICY IF EXISTS consultation_notes_update_clinic ON consultation_notes;
DROP POLICY IF EXISTS consultation_notes_delete_staff  ON consultation_notes;

CREATE POLICY consultation_notes_select_admin ON consultation_notes
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY consultation_notes_select_clinic ON consultation_notes
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY consultation_notes_insert_clinic ON consultation_notes
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY consultation_notes_update_clinic ON consultation_notes
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY consultation_notes_delete_staff ON consultation_notes
  FOR DELETE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
    AND COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'staff'
  );


-- ============================================================================
-- VITAL_SIGNS
-- ============================================================================
DROP POLICY IF EXISTS vital_signs_select_admin  ON vital_signs;
DROP POLICY IF EXISTS vital_signs_select_clinic ON vital_signs;
DROP POLICY IF EXISTS vital_signs_insert_clinic ON vital_signs;
DROP POLICY IF EXISTS vital_signs_update_clinic ON vital_signs;

CREATE POLICY vital_signs_select_admin ON vital_signs
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY vital_signs_select_clinic ON vital_signs
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY vital_signs_insert_clinic ON vital_signs
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY vital_signs_update_clinic ON vital_signs
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


-- ============================================================================
-- MEDICAL_HISTORY
-- ============================================================================
DROP POLICY IF EXISTS medical_history_select_admin  ON medical_history;
DROP POLICY IF EXISTS medical_history_select_clinic ON medical_history;
DROP POLICY IF EXISTS medical_history_insert_clinic ON medical_history;
DROP POLICY IF EXISTS medical_history_update_clinic ON medical_history;

CREATE POLICY medical_history_select_admin ON medical_history
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY medical_history_select_clinic ON medical_history
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY medical_history_insert_clinic ON medical_history
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY medical_history_update_clinic ON medical_history
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


-- ============================================================================
-- VACCINE_RECORDS
-- ============================================================================
DROP POLICY IF EXISTS vaccine_records_select_admin  ON vaccine_records;
DROP POLICY IF EXISTS vaccine_records_select_clinic ON vaccine_records;
DROP POLICY IF EXISTS vaccine_records_insert_clinic ON vaccine_records;
DROP POLICY IF EXISTS vaccine_records_update_clinic ON vaccine_records;

CREATE POLICY vaccine_records_select_admin ON vaccine_records
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY vaccine_records_select_clinic ON vaccine_records
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY vaccine_records_insert_clinic ON vaccine_records
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY vaccine_records_update_clinic ON vaccine_records
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


-- ============================================================================
-- ATTACHMENTS
-- ============================================================================
DROP POLICY IF EXISTS attachments_select_admin  ON attachments;
DROP POLICY IF EXISTS attachments_select_clinic ON attachments;
DROP POLICY IF EXISTS attachments_insert_clinic ON attachments;
DROP POLICY IF EXISTS attachments_delete_clinic ON attachments;

CREATE POLICY attachments_select_admin ON attachments
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY attachments_select_clinic ON attachments
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY attachments_insert_clinic ON attachments
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY attachments_delete_clinic ON attachments
  FOR DELETE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


-- ============================================================================
-- PRESCRIPTIONS
-- ============================================================================
DROP POLICY IF EXISTS prescriptions_select_admin  ON prescriptions;
DROP POLICY IF EXISTS prescriptions_select_clinic ON prescriptions;
DROP POLICY IF EXISTS prescriptions_insert_clinic ON prescriptions;
DROP POLICY IF EXISTS prescriptions_update_clinic ON prescriptions;

CREATE POLICY prescriptions_select_admin ON prescriptions
  FOR SELECT
  USING (
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      auth.jwt() -> 'app_metadata'  ->> 'user_role'
    ) = 'admin'
  );

CREATE POLICY prescriptions_select_clinic ON prescriptions
  FOR SELECT
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY prescriptions_insert_clinic ON prescriptions
  FOR INSERT
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );

CREATE POLICY prescriptions_update_clinic ON prescriptions
  FOR UPDATE
  USING (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  )
  WITH CHECK (
    clinic_id = COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'clinic_id',
      auth.jwt() -> 'app_metadata'  ->> 'clinic_id'
    )::uuid
  );


COMMIT;
