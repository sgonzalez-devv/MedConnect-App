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

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data into existing tables...\n');

    // 1. Create clinic
    console.log('📍 Creating test clinic...');
    const { data: clinic, error: clinicErr } = await supabase
      .from('clinics')
      .insert({
        name: 'Medical City Clinic',
        address: '123 Health St',
        phone: '555-0100',
        email: 'clinic@medicalcity.com',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62701',
        country: 'USA'
      })
      .select()
      .single();

    if (clinicErr) throw new Error(`Clinic: ${clinicErr.message}`);
    console.log(`✅ Clinic created: ${clinic.id}\n`);

    // 2. Create patients
    console.log('👥 Creating test patients...');
    const { data: patients, error: patientsErr } = await supabase
      .from('patients')
      .insert([
        {
          clinic_id: clinic.id,
          full_name: 'John Smith',
          date_of_birth: '1980-05-15',
          gender: 'male',
          email: 'john@example.com',
          phone: '555-0101',
          address: '456 Oak Ave',
          status: 'active'
        },
        {
          clinic_id: clinic.id,
          full_name: 'Maria Garcia',
          date_of_birth: '1975-08-22',
          gender: 'female',
          email: 'maria@example.com',
          phone: '555-0102',
          address: '789 Elm St',
          status: 'active'
        },
        {
          clinic_id: clinic.id,
          full_name: 'Robert Johnson',
          date_of_birth: '1988-03-10',
          gender: 'male',
          email: 'robert@example.com',
          phone: '555-0103',
          address: '321 Pine Rd',
          status: 'active'
        }
      ])
      .select();

    if (patientsErr) throw new Error(`Patients: ${patientsErr.message}`);
    console.log(`✅ ${patients.length} patients created\n`);

    // 3. Create appointments
    console.log('📅 Creating test appointments...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: appointments, error: apptsErr } = await supabase
      .from('appointments')
      .insert([
        {
          clinic_id: clinic.id,
          patient_id: patients[0].id,
          appointment_datetime: tomorrow.toISOString(),
          duration_minutes: 30,
          status: 'scheduled',
          reason_for_visit: 'Annual checkup'
        },
        {
          clinic_id: clinic.id,
          patient_id: patients[1].id,
          appointment_datetime: nextWeek.toISOString(),
          duration_minutes: 45,
          status: 'scheduled',
          reason_for_visit: 'Follow-up consultation'
        },
        {
          clinic_id: clinic.id,
          patient_id: patients[2].id,
          appointment_datetime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 30,
          status: 'scheduled',
          reason_for_visit: 'Lab results review'
        }
      ])
      .select();

    if (apptsErr) throw new Error(`Appointments: ${apptsErr.message}`);
    console.log(`✅ ${appointments.length} appointments created\n`);

    console.log('🎉 SUCCESS! Database is fully populated');
    console.log(`\n📊 Summary:`);
    console.log(`   Clinic: ${clinic.id}`);
    console.log(`   Patients: ${patients.map(p => p.full_name).join(', ')}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`\n✅ You can now test the forms and calendar!`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

seedTestData();
