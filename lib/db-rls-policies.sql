-- Row-Level Security Policies for MedConnect
-- Phase 3: Database Schema & Row-Level Security
-- Plan 3: RLS policies enforcing clinic isolation at PostgreSQL layer

-- Enable RLS on all 10 tables
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

-- CLINICS table policies
-- Admin can view all clinics
CREATE POLICY clinics_select_admin ON clinics
  FOR SELECT
  USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Users can view their own clinic
CREATE POLICY clinics_select_user ON clinics
  FOR SELECT
  USING (id = (auth.jwt() ->> 'clinic_id')::uuid);

-- PATIENTS table policies
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

-- DOCTOR_PROFILES table policies
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

-- APPOINTMENTS table policies
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

-- CONSULTATION_NOTES table policies
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

-- VITAL_SIGNS table policies
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

-- MEDICAL_HISTORY table policies
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

-- VACCINE_RECORDS table policies
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

-- ATTACHMENTS table policies
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

-- PRESCRIPTIONS table policies
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
