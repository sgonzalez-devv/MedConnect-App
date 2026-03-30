-- Core database schema for MedConnect
-- Phase 3: Database Schema & Row-Level Security
-- Plan 1: Core tables with clinic isolation

-- 1. clinics table
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
