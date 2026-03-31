-- Core Database Schema for MedConnect
-- Phase 3: Database Schema & Row-Level Security
-- 
-- This file contains DDL for all tables in the system:
-- 1. Core Tables (Plan 01): clinics, patients, doctor_profiles, appointments, consultation_notes
-- 2. Data Tables (Plan 02): vital_signs, medical_history, vaccine_records, attachments, prescriptions
-- 3. RLS Policies (Plan 03): Enforce clinic isolation at Postgres layer
--
-- Execution: Run each CREATE TABLE statement in Supabase SQL editor (manually or via migrations)
-- Notes: All timestamps use TIMESTAMP WITH TIME ZONE, all IDs use UUID with gen_random_uuid()

-- ============================================================================
-- PLAN 01: CORE TABLES
-- ============================================================================

-- 1. clinics table (the isolation boundary)
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

-- 2. patients table (clinic_id is the isolation boundary)
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

-- 3. doctor_profiles table (doctors belong to clinics)
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

-- 4. appointments table (clinic_id isolation)
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

-- 5. consultation_notes table (clinic_id isolation)
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

-- ============================================================================
-- PLAN 02: DATA TABLES
-- ============================================================================

-- 6. vital_signs table
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

-- 7. medical_history table
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

-- 8. vaccine_records table
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

-- 9. attachments table
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

-- 10. prescriptions table
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
