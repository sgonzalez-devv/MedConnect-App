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

async function createTestUsers(clinicId) {
  try {
    console.log('👥 Creating test users with different roles...\n');

    // Test user credentials
    const users = [
      {
        email: 'admin@medicalcity.com',
        password: 'AdminPass123!',
        role: 'admin',
        full_name: 'Admin User'
      },
      {
        email: 'doctor@medicalcity.com',
        password: 'DoctorPass123!',
        role: 'doctor',
        full_name: 'Dr. James Wilson'
      },
      {
        email: 'staff@medicalcity.com',
        password: 'StaffPass123!',
        role: 'staff',
        full_name: 'Sarah Staff'
      }
    ];

    const createdUsers = [];

    // Create each user
    for (const userData of users) {
      console.log(`📝 Creating ${userData.role} user (${userData.email})...`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          clinic_id: clinicId,
          user_role: userData.role
        }
      });

      if (authError) {
        console.error(`  ❌ Auth creation failed: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;
      console.log(`  ✅ Auth user created: ${userId}`);

      // If doctor, create doctor_profile
      if (userData.role === 'doctor') {
        console.log(`  📋 Creating doctor profile...`);
        const { error: doctorError } = await supabase
          .from('doctor_profiles')
          .insert({
            user_id: userId,
            clinic_id: clinicId,
            specialization: 'General Medicine',
            license_number: `LIC-${userId.substring(0, 8).toUpperCase()}`,
            biography: `${userData.full_name} is an experienced physician.`,
            office_phone: '555-0200',
            office_email: userData.email
          });

        if (doctorError) {
          console.log(`  ⚠️  Doctor profile: ${doctorError.message}`);
        } else {
          console.log(`  ✅ Doctor profile created`);
        }
      }

      createdUsers.push({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        userId: userId,
        clinic_id: clinicId
      });

      console.log('');
    }

    console.log('🎉 User creation complete!\n');
    console.log('📊 Test Credentials:\n');

    console.log('═══════════════════════════════════════════════════════════');
    createdUsers.forEach(user => {
      console.log(`\n🔐 ${user.role.toUpperCase()}`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Clinic:   ${user.clinic_id}`);
      console.log(`   User ID:  ${user.userId}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════');

    console.log('\n✅ All users ready for testing!');
    console.log('\n💡 Tips:');
    console.log('   • Admin can see all clinics and users');
    console.log('   • Doctor can see patients and create appointments');
    console.log('   • Staff can create/edit patients and manage clinic data');
    console.log('\n🔒 Save these credentials safely (not in git)!');

    return createdUsers;

  } catch (error) {
    console.error('❌ User creation failed:', error.message);
    process.exit(1);
  }
}

// Main flow
(async () => {
  // First check if clinic exists
  console.log('🔍 Checking for test clinic...\n');

  const { data: clinics, error: clinicError } = await supabase
    .from('clinics')
    .select('id')
    .eq('name', 'Medical City Clinic')
    .order('created_at', { ascending: false })
    .limit(1);

  if (clinicError) {
    console.error('❌ Error checking clinics:', clinicError.message);
    process.exit(1);
  }

  if (!clinics || clinics.length === 0) {
    console.error('❌ Test clinic not found!');
    console.error('   Run the following first:');
    console.error('   1. Execute .supabase/001-schema.sql in Supabase dashboard');
    console.error('   2. Execute .supabase/002-rls-policies.sql in Supabase dashboard');
    console.error('   3. Run: node scripts/setup-complete.js');
    process.exit(1);
  }

  const clinicId = clinics[0].id;
  console.log(`✅ Found clinic: ${clinicId}\n`);
  await createTestUsers(clinicId);
})();
