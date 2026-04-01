/**
 * Crea un usuario doctor sin clínica asignada — para testing de onboarding.
 * Ejecutar: node scripts/create-doctor-no-clinic.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

(async () => {
  const email    = 'doctor.test@medconnect.com';
  const password = 'DoctorTest123!';
  const fullName = 'Dr. Test MedConnect';

  console.log(`\n🩺  Creando usuario doctor sin clínica…`);
  console.log(`    Email:    ${email}`);
  console.log(`    Password: ${password}\n`);

  // 1. Intentar eliminar si ya existe (evita error de duplicate email)
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);
  if (found) {
    console.log(`⚠️  Ya existe un usuario con ese email (${found.id}). Eliminando…`);
    await supabase.auth.admin.deleteUser(found.id);
    console.log(`✅  Usuario previo eliminado.\n`);
  }

  // 2. Crear el usuario
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,          // sin necesidad de confirmar correo
    user_metadata: {
      full_name: fullName,
      user_role: 'doctor',
      // ⚠️  clinic_id intencionalmente NO asignado
      //     → la app mostrará el banner de configuración inicial
    },
  });

  if (error) {
    console.error(`❌  Error al crear usuario: ${error.message}`);
    process.exit(1);
  }

  console.log('✅  Usuario creado exitosamente!\n');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Email:     ${email}`);
  console.log(`  Password:  ${password}`);
  console.log(`  Rol:       doctor`);
  console.log(`  Clínica:   (ninguna — usuario nuevo)`);
  console.log(`  User ID:   ${data.user.id}`);
  console.log('═══════════════════════════════════════════════');
  console.log('\n💡  Al iniciar sesión verá el banner de onboarding.');
  console.log('    Para asignarle una clínica, edita su user_metadata en');
  console.log('    Supabase Dashboard → Authentication → Users.\n');
})();
