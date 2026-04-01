/**
 * GET  /api/clinics  – List clinics the current user belongs to
 * POST /api/clinics  – Create a new clinic (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getClinicContext } from '@/lib/auth-context'

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient()

  // getUser() verifies the JWT; we need the raw user to read metadata
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const clinic_id: string | undefined =
    user.user_metadata?.clinic_id ?? user.app_metadata?.clinic_id

  if (!clinic_id) {
    // New user: no clinic assigned yet – return empty list
    return NextResponse.json({ data: [], total: 0 }, { status: 200 })
  }

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinic_id)
    .order('name')

  if (error) {
    console.error('[GET /api/clinics]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 }, { status: 200 })
}

// ─── POST ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const ctx = await getClinicContext()

  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (ctx.user_role !== 'admin') {
    return NextResponse.json({ error: 'Solo los administradores pueden crear clínicas', code: 'FORBIDDEN' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido', code: 'INVALID_BODY' }, { status: 400 })
  }

  const { name, location, email, telefono } = body as {
    name?: string
    location?: string
    email?: string
    telefono?: string
  }

  if (!name || !location || !email || !telefono) {
    return NextResponse.json(
      { error: 'Los campos nombre, ubicación, email y teléfono son requeridos', code: 'MISSING_FIELDS' },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clinics')
    .insert({
      name,
      location,
      email,
      telefono,
      // Assign default color palette
      color_palette: { presetName: 'teal' },
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/clinics]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
