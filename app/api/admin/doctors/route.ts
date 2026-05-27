import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getClinicContext } from '@/lib/auth-context'

export async function GET() {
  const ctx = await getClinicContext()
  if (!ctx || ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }

  const supabase = await createClient()

  // Get doctor profiles joined with auth users via RPC or direct query
  // For now, query doctor_profiles and return them
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('id, user_id, specialization, profession, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const ctx = await getClinicContext()
  if (!ctx || ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Solo los administradores pueden crear doctores', code: 'FORBIDDEN' }, { status: 403 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'Función no disponible: falta la clave de servicio de Supabase', code: 'CONFIG_ERROR' },
      { status: 500 }
    )
  }

  let body: { full_name?: string; email?: string; password?: string; profession?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido', code: 'INVALID_BODY' }, { status: 400 })
  }

  const { full_name, email, password, profession } = body
  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: 'Nombre, correo y contraseña son requeridos', code: 'MISSING_FIELDS' },
      { status: 400 }
    )
  }

  // Use Supabase Admin API to create user
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      user_role: 'doctor',
      profession: profession || null,
    },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Create a doctor_profile entry
  const supabase = await createClient()
  await supabase.from('doctor_profiles').insert({
    user_id: newUser.user.id,
    profession: profession || null,
    specialization: profession || null,
  })

  return NextResponse.json({ data: { id: newUser.user.id, email, full_name, profession } }, { status: 201 })
}
