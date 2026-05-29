import { NextRequest, NextResponse } from 'next/server'
import { getClinicContext } from '@/lib/auth-context'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role config')
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// GET /api/admin/doctors — list all users grouped by role
export async function GET() {
  const ctx = await getClinicContext()
  if (!ctx || ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const admin = getAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const users = (data.users || []).map((u) => ({
      id: u.id,
      email: u.email ?? '',
      full_name: u.user_metadata?.full_name ?? '',
      user_role: u.user_metadata?.user_role ?? 'staff',
      profession: u.user_metadata?.profession ?? null,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      confirmed: !!u.email_confirmed_at,
    }))

    return NextResponse.json({ data: users }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/admin/doctors — create a new user (doctor or staff)
export async function POST(request: NextRequest) {
  const ctx = await getClinicContext()
  if (!ctx || ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden crear usuarios' }, { status: 403 })
  }

  let body: {
    full_name?: string
    email?: string
    password?: string
    profession?: string
    user_role?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { full_name, email, password, profession, user_role = 'doctor' } = body
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: 'Nombre, correo y contraseña son requeridos' }, { status: 400 })
  }

  try {
    const admin = getAdminClient()
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        user_role,
        profession: profession || null,
        clinic_id: ctx.clinic_id,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        id: newUser.user.id,
        email,
        full_name,
        user_role,
        profession: profession || null,
      },
    }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/admin/doctors — update user metadata
export async function PATCH(request: NextRequest) {
  const ctx = await getClinicContext()
  if (!ctx || ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { id?: string; full_name?: string; profession?: string; user_role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  try {
    const admin = getAdminClient()
    const { data: existing } = await admin.auth.admin.getUserById(id)
    const currentMeta = existing.user?.user_metadata ?? {}

    const { data, error } = await admin.auth.admin.updateUserById(id, {
      user_metadata: {
        ...currentMeta,
        ...(updates.full_name !== undefined && { full_name: updates.full_name }),
        ...(updates.profession !== undefined && { profession: updates.profession }),
        ...(updates.user_role !== undefined && { user_role: updates.user_role }),
        // Auto-assign admin's clinic if the doctor has none yet
        ...(!currentMeta.clinic_id && { clinic_id: ctx.clinic_id }),
      },
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      data: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
        user_role: data.user.user_metadata?.user_role,
        profession: data.user.user_metadata?.profession,
      },
    }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/admin/doctors — delete a user
export async function DELETE(request: NextRequest) {
  const ctx = await getClinicContext()
  if (!ctx || ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  try {
    const admin = getAdminClient()
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: null }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
