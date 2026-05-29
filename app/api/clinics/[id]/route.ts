import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getClinicContext } from '@/lib/auth-context'

// PATCH /api/clinics/[id] — update clinic info (admin or doctor/owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getClinicContext()
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Staff cannot edit clinics
  if (ctx.user_role === 'staff') {
    return NextResponse.json(
      { error: 'El personal de staff no puede editar clínicas', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  // Whitelist editable fields
  const allowed = ['name', 'location', 'email', 'telefono', 'specialty', 'specialty_custom', 'settings']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const supabase = await createClient()

  // Admin can update any clinic; doctors can only update clinics they own
  const query = supabase.from('clinics').update(updates).eq('id', id)

  if (ctx.user_role === 'doctor') {
    query.eq('owner_id', ctx.user_id)
  }

  const { data, error } = await query.select().single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Clínica no encontrada o sin permisos' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 200 })
}

// GET /api/clinics/[id] — fetch single clinic
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getClinicContext()
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Clínica no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ data }, { status: 200 })
}
