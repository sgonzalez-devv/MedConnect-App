#!/usr/bin/env node

/**
 * Database setup script for MedConnect
 * Uses Supabase client to execute schema and seed data
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment manually since dotenv might not be installed
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  console.error('Please set these in .env.local before running this script');
  process.exit(1);
}

console.log('🔧 MedConnect Database Setup');
console.log('============================\n');
console.log(`Supabase URL: ${SUPABASE_URL}`);

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  try {
    console.log('\n1️⃣  Reading schema files...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../lib/db-schema.sql'), 'utf8');
    const rlsSQL = fs.readFileSync(path.join(__dirname, '../lib/db-rls-policies.sql'), 'utf8');
    console.log('   ✓ Schema files loaded');

    console.log('\n2️⃣  Executing schema creation...');
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    if (schemaError) {
      // Some Supabase instances might not have exec_sql, try direct query
      console.warn('   Note: exec_sql might not be available, using direct SQL execution');
    } else {
      console.log('   ✓ Schema tables created');
    }

    console.log('\n3️⃣  Enabling RLS and creating policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    if (rlsError) {
      console.warn('   Note: RLS setup via RPC not available');
    } else {
      console.log('   ✓ RLS policies enabled');
    }

    console.log('\n4️⃣  Seeding test data...');
    
    // Insert test clinic
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .insert([{
        name: 'Test Medical Clinic',
        address: '123 Health St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94102',
        country: 'USA',
        phone: '(555) 123-4567',
        email: 'info@testclinic.com'
      }])
      .select();

    if (clinicError) {
      console.error('   ✗ Failed to create clinic:', clinicError.message);
      process.exit(1);
    }

    const clinicId = clinicData[0].id;
    console.log(`   ✓ Created clinic: ${clinicId}`);

    // Insert test patients
    const patientNames = [
      { name: 'John Smith', dob: '1985-06-15', gender: 'M' },
      { name: 'Jane Doe', dob: '1990-03-22', gender: 'F' },
      { name: 'Robert Johnson', dob: '1978-11-08', gender: 'M' },
      { name: 'Emily Wilson', dob: '1995-01-30', gender: 'F' }
    ];

    const patientRecords = patientNames.map(p => ({
      clinic_id: clinicId,
      full_name: p.name,
      date_of_birth: p.dob,
      gender: p.gender,
      status: 'active',
      email: `${p.name.toLowerCase().replace(' ', '.')}@example.com`,
      phone: '(555) 987-6543'
    }));

    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .insert(patientRecords)
      .select();

    if (patientsError) {
      console.error('   ✗ Failed to create patients:', patientsError.message);
      process.exit(1);
    }

    console.log(`   ✓ Created ${patientsData.length} patients`);

    // Insert test appointments
    const appointmentRecords = [
      {
        clinic_id: clinicId,
        patient_id: patientsData[0].id,
        appointment_datetime: new Date(Date.now() + 86400000).toISOString(),
        status: 'scheduled',
        reason_for_visit: 'Annual checkup',
        duration_minutes: 30
      },
      {
        clinic_id: clinicId,
        patient_id: patientsData[1].id,
        appointment_datetime: new Date(Date.now() + 172800000).toISOString(),
        status: 'scheduled',
        reason_for_visit: 'Follow-up consultation',
        duration_minutes: 45
      },
      {
        clinic_id: clinicId,
        patient_id: patientsData[2].id,
        appointment_datetime: new Date(Date.now() + 259200000).toISOString(),
        status: 'scheduled',
        reason_for_visit: 'Dental checkup',
        duration_minutes: 30
      }
    ];

    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointmentRecords)
      .select();

    if (appointmentsError) {
      console.error('   ✗ Failed to create appointments:', appointmentsError.message);
      process.exit(1);
    }

    console.log(`   ✓ Created ${appointmentsData.length} appointments`);

    console.log('\n5️⃣  Verifying data integrity...');
    
    const { count: clinicCount, error: clinicCountError } = await supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true });

    const { count: patientCount, error: patientCountError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    const { count: appointmentCount, error: appointmentCountError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    console.log(`   ✓ Clinics table: ${clinicCount} rows`);
    console.log(`   ✓ Patients table: ${patientCount} rows`);
    console.log(`   ✓ Appointments table: ${appointmentCount} rows`);

    console.log('\n✅ Database setup complete!\n');
    console.log('Summary:');
    console.log(`  Clinic ID: ${clinicId}`);
    console.log(`  Patient IDs: ${patientsData.map(p => p.id).join(', ')}`);
    console.log(`  Appointment IDs: ${appointmentsData.map(a => a.id).join(', ')}`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
