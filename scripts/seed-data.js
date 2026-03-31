const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function seedData() {
  try {
    console.log('🌱 Seeding test data...\n');

    // Create clinic
    console.log('📍 Creating clinic...');
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert([{
        name: 'Medical City Clinic',
        address: '123 Health St',
        phone: '555-0100',
        email: 'clinic@medicalcity.com',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62701',
        country: 'USA'
      }])
      .select()
      .single();

    if (clinicError) {
      console.error('❌ Clinic creation failed:', clinicError.message);
      process.exit(1);
    }
    
    const clinicId = clinic.id;
    console.log(`✅ Clinic created: ${clinicId}\n`);

    // Create patients
    console.log('👥 Creating patients...');
    const patientData = [
      {
        clinic_id: clinicId,
        full_name: 'John Smith',
        date_of_birth: '1980-05-15',
        gender: 'male',
        email: 'john@example.com',
        phone: '555-0101',
        address: '456 Oak Ave',
        status: 'active'
      },
      {
        clinic_id: clinicId,
        full_name: 'Maria Garcia',
        date_of_birth: '1975-08-22',
        gender: 'female',
        email: 'maria@example.com',
        phone: '555-0102',
        address: '789 Elm St',
        status: 'active'
      },
      {
        clinic_id: clinicId,
        full_name: 'Robert Johnson',
        date_of_birth: '1988-03-10',
        gender: 'male',
        email: 'robert@example.com',
        phone: '555-0103',
        address: '321 Pine Rd',
        status: 'active'
      },
      {
        clinic_id: clinicId,
        full_name: 'Sarah Williams',
        date_of_birth: '1992-11-30',
        gender: 'female',
        email: 'sarah@example.com',
        phone: '555-0104',
        address: '654 Maple Dr',
        status: 'active'
      }
    ];

    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .insert(patientData)
      .select();

    if (patientsError) {
      console.error('❌ Patients creation failed:', patientsError.message);
      process.exit(1);
    }

    console.log(`✅ ${patients.length} patients created\n`);

    // Create appointments
    console.log('📅 Creating appointments...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const appointmentData = [
      {
        clinic_id: clinicId,
        patient_id: patients[0].id,
        appointment_datetime: tomorrow.toISOString(),
        duration_minutes: 30,
        status: 'scheduled',
        reason_for_visit: 'Annual checkup'
      },
      {
        clinic_id: clinicId,
        patient_id: patients[1].id,
        appointment_datetime: nextWeek.toISOString(),
        duration_minutes: 45,
        status: 'scheduled',
        reason_for_visit: 'Follow-up consultation'
      },
      {
        clinic_id: clinicId,
        patient_id: patients[2].id,
        appointment_datetime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 30,
        status: 'scheduled',
        reason_for_visit: 'Lab results review'
      }
    ];

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select();

    if (appointmentsError) {
      console.error('❌ Appointments creation failed:', appointmentsError.message);
      process.exit(1);
    }

    console.log(`✅ ${appointments.length} appointments created\n`);

    // Summary
    console.log('🎉 Seed complete!');
    console.log(`   Clinic ID: ${clinicId}`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log('\n✅ Database ready for integration testing');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedData();
