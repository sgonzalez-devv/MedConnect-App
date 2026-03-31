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

async function createTables() {
  try {
    console.log('🔧 Creating tables via direct Postgres...\n');

    // Create clinics table
    console.log('📍 Creating clinics table...');
    const { error: e1 } = await supabase.rpc('sql_from_typescript', {
      query: `
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
      `
    }).catch(e => ({ error: e }));
    
    if (!e1) console.log('✅ clinics table created');

    // Create patients table
    console.log('📋 Creating patients table...');
    const { error: e2 } = await supabase.rpc('sql_from_typescript', {
      query: `
        CREATE TABLE IF NOT EXISTS patients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
          full_name VARCHAR(255) NOT NULL,
          date_of_birth DATE,
          gender VARCHAR(10),
          email VARCHAR(255),
          phone VARCHAR(20),
          address VARCHAR(500),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(e => ({ error: e }));
    
    if (!e2) console.log('✅ patients table created');

    // Create appointments table
    console.log('📅 Creating appointments table...');
    const { error: e3 } = await supabase.rpc('sql_from_typescript', {
      query: `
        CREATE TABLE IF NOT EXISTS appointments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
          patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
          duration_minutes INTEGER DEFAULT 30,
          status VARCHAR(50) DEFAULT 'scheduled',
          reason_for_visit TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(e => ({ error: e }));
    
    if (!e3) console.log('✅ appointments table created');

    console.log('\n✅ Base tables created');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTables();
