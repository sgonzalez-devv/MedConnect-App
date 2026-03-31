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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSQLViaGraphQL(sql) {
  // Try GraphQL endpoint which supports raw SQL
  const query = `
    query {
      __typename
    }
  `;

  try {
    const response = await fetch(`${supabaseUrl}/graphql/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    console.log('GraphQL response:', data);
  } catch (error) {
    console.error('GraphQL error:', error.message);
  }
}

async function createMigrationFile() {
  console.log('📝 Creating SQL migration file you can run manually...\n');

  const schema = fs.readFileSync(path.join(__dirname, '../lib/db-schema.sql'), 'utf8');
  const policies = fs.readFileSync(path.join(__dirname, '../lib/db-rls-policies.sql'), 'utf8');

  const migrationContent = `-- Supabase Migration: Create Tables and RLS
-- Created: ${new Date().toISOString()}
-- Run this in Supabase Dashboard > SQL Editor

BEGIN;

${schema}

${policies}

COMMIT;
`;

  const migrationPath = path.join(__dirname, '../migrations', `001_create_schema_${Date.now()}.sql`);
  
  if (!fs.existsSync(path.join(__dirname, '../migrations'))) {
    fs.mkdirSync(path.join(__dirname, '../migrations'), { recursive: true });
  }

  fs.writeFileSync(migrationPath, migrationContent);
  console.log(`✅ Migration file created: migrations/001_create_schema_*.sql`);
  console.log(`\n📋 HOW TO APPLY:`);
  console.log(`1. Go to: https://supabase.com/dashboard/project/knbnvwlmxbidfiixnylg/sql`);
  console.log(`2. Click "New Query"`);
  console.log(`3. Copy-paste the migration file content`);
  console.log(`4. Click "Run"`);
  console.log(`\n📂 File location: ${migrationPath}`);
}

createMigrationFile();
