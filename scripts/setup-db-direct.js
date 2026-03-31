const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env from file
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE credentials');
  console.error('SUPABASE_URL:', supabaseUrl ? 'found' : 'missing');
  console.error('SERVICE_KEY:', supabaseServiceKey ? 'found' : 'missing');
  process.exit(1);
}

console.log('✅ Credentials loaded');
console.log('🔑 URL:', supabaseUrl.substring(0, 40) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function setupDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../lib/db-schema.sql');
    const policiesPath = path.join(__dirname, '../lib/db-rls-policies.sql');
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const policies = fs.readFileSync(policiesPath, 'utf8');

    // Parse statements
    const schemaStmts = schema.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    const policiesStmts = policies.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

    console.log(`\n📋 Found ${schemaStmts.length} schema statements, ${policiesStmts.length} RLS statements`);

    // Execute schema
    console.log('\n🔧 Creating tables and indexes...');
    let success = 0;
    for (let i = 0; i < schemaStmts.length; i++) {
      const stmt = schemaStmts[i].trim();
      const { error } = await supabase.rpc('exec_sql', { query: stmt });
      if (!error) {
        success++;
        if (stmt.toLowerCase().startsWith('create table')) {
          const tableName = stmt.match(/create table[^(]*\(?([^\s(]+)/i)?.[1];
          console.log(`  ✅ ${tableName || 'table'}`);
        }
      }
    }
    console.log(`✅ ${success}/${schemaStmts.length} schema statements executed`);

    // Execute RLS
    console.log('\n🔧 Enabling RLS policies...');
    success = 0;
    for (let i = 0; i < policiesStmts.length; i++) {
      const stmt = policiesStmts[i].trim();
      const { error } = await supabase.rpc('exec_sql', { query: stmt });
      if (!error) success++;
    }
    console.log(`✅ ${success}/${policiesStmts.length} RLS statements executed`);

    // Verify
    console.log('\n🔍 Verifying tables...');
    const tables = ['clinics', 'patients', 'doctor_profiles', 'appointments', 'consultation_notes', 
                   'vital_signs', 'medical_history', 'vaccine_records', 'attachments', 'prescriptions'];
    
    let verified = 0;
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`  ✅ ${table} (${count} rows)`);
        verified++;
      } else {
        console.log(`  ❌ ${table}`);
      }
    }

    console.log(`\n✅ Database setup: ${verified}/10 tables verified`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
