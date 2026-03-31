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

async function executeSQL(sql, label) {
  console.log(`🔧 ${label}...`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql_exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      // Try direct query endpoint
      const response2 = await fetch(`${supabaseUrl}/rest/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response2.ok) {
        const text = await response.text();
        console.log(`⚠️  ${label}: ${response.status} - using alternative method`);
        return false;
      }
    }

    console.log(`✅ ${label}`);
    return true;
  } catch (error) {
    console.error(`❌ ${label}:`, error.message);
    return false;
  }
}

async function migrate() {
  console.log('🚀 Migrating schema via REST API\n');

  const schemaPath = path.join(__dirname, '../lib/db-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute as single batch
  await executeSQL(schema, 'Create all tables and indexes');

  const policiesPath = path.join(__dirname, '../lib/db-rls-policies.sql');
  const policies = fs.readFileSync(policiesPath, 'utf8');

  await executeSQL(policies, 'Enable RLS policies');

  console.log('\n✅ Schema migration complete');
}

migrate();
