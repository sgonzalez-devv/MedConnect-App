import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getClinicContext } from '@/lib/auth-context'

export async function GET(request: NextRequest) {
  const ctx = await getClinicContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const patient_id = url.searchParams.get('patient_id')
  if (!patient_id) return NextResponse.json({ error: 'patient_id requerido' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('percentile_records')
    .select('*')
    .eq('patient_id', patient_id)
    .order('recorded_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const ctx = await getClinicContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { patient_id, weight_kg, height_cm, head_circumference_cm, age_months, notes } = body as {
    patient_id?: string; weight_kg?: number; height_cm?: number;
    head_circumference_cm?: number; age_months?: number; notes?: string
  }

  if (!patient_id) return NextResponse.json({ error: 'patient_id requerido' }, { status: 400 })

  const supabase = await createClient()

  // First verify the patient belongs to a clinic this user can access
  const { data: patient } = await supabase
    .from('patients')
    .select('clinic_id')
    .eq('id', patient_id)
    .single()

  if (!patient) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })

  const { data, error } = await supabase
    .from('percentile_records')
    .insert({
      clinic_id: patient.clinic_id,
      patient_id,
      weight_kg: weight_kg ?? null,
      height_cm: height_cm ?? null,
      head_circumference_cm: head_circumference_cm ?? null,
      age_months: age_months ?? null,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
