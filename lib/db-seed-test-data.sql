-- Test Data for MedConnect Database
-- This file contains INSERT statements for seeding test data
-- Use this if you need to manually insert test data in Supabase

-- 1. Create Test Clinic
INSERT INTO clinics (name, address, city, state, zip_code, country, phone, email)
VALUES (
  'Test Medical Clinic',
  '123 Health St',
  'San Francisco',
  'CA',
  '94102',
  'USA',
  '(555) 123-4567',
  'info@testclinic.com'
)
ON CONFLICT DO NOTHING;

-- Store clinic ID for use in subsequent inserts
-- Note: In manual execution, get the clinic ID from the previous insert result
-- and replace the subquery below with the actual UUID

-- 2. Create Test Patients
INSERT INTO patients (
  clinic_id,
  full_name,
  date_of_birth,
  gender,
  email,
  phone,
  status
)
VALUES
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    'John Smith',
    '1985-06-15',
    'M',
    'john.smith@example.com',
    '(555) 987-6543',
    'active'
  ),
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    'Jane Doe',
    '1990-03-22',
    'F',
    'jane.doe@example.com',
    '(555) 987-6543',
    'active'
  ),
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    'Robert Johnson',
    '1978-11-08',
    'M',
    'robert.johnson@example.com',
    '(555) 987-6543',
    'active'
  ),
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    'Emily Wilson',
    '1995-01-30',
    'F',
    'emily.wilson@example.com',
    '(555) 987-6543',
    'active'
  )
ON CONFLICT DO NOTHING;

-- 3. Create Test Appointments
-- Note: Date/time values use CURRENT_TIMESTAMP + interval for relative dates
INSERT INTO appointments (
  clinic_id,
  patient_id,
  appointment_datetime,
  duration_minutes,
  status,
  reason_for_visit
)
VALUES
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    (SELECT id FROM patients WHERE full_name = 'John Smith' AND clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1) LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    30,
    'scheduled',
    'Annual checkup'
  ),
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    (SELECT id FROM patients WHERE full_name = 'Jane Doe' AND clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1) LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    45,
    'scheduled',
    'Follow-up consultation'
  ),
  (
    (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1),
    (SELECT id FROM patients WHERE full_name = 'Robert Johnson' AND clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1) LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    30,
    'scheduled',
    'Dental checkup'
  )
ON CONFLICT DO NOTHING;

-- 4. Verification Queries
-- Run these to verify the data was inserted correctly

-- Check clinic was created
-- SELECT * FROM clinics WHERE name = 'Test Medical Clinic';
-- Expected: 1 row

-- Check patients were created
-- SELECT COUNT(*) FROM patients WHERE clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1);
-- Expected: 4

-- Check appointments were created
-- SELECT COUNT(*) FROM appointments WHERE clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic' LIMIT 1);
-- Expected: 3

-- View all test data relationships
-- SELECT
--   c.name as clinic_name,
--   p.full_name as patient_name,
--   a.reason_for_visit,
--   a.appointment_datetime
-- FROM clinics c
-- LEFT JOIN patients p ON c.id = p.clinic_id
-- LEFT JOIN appointments a ON p.id = a.patient_id AND c.id = a.clinic_id
-- WHERE c.name = 'Test Medical Clinic'
-- ORDER BY a.appointment_datetime;
