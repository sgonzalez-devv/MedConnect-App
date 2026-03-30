/**
 * GET /api/patients - Fetch all patients for current user's clinic
 * POST /api/patients - Create new patient in current user's clinic
 * 
 * @requirement API-01, API-02
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { handleSupabaseError, isAuthError } from '@/lib/error-handling'
import { getPatients, createPatient as createPatientQuery } from '@/lib/api-service'
import type { Patient } from '@/lib/types'

/**
 * GET /api/patients
 * Fetch all patients for current clinic
 * 
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 * 
 * @requirement API-01
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check authentication
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Get clinic_id from custom JWT claims
    // In Supabase, custom claims are stored in user.user_metadata
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      )
    }

    // Extract clinic_id from JWT claims (set during login in Phase 02)
    // For now, we'll query the users table to get clinic_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('clinic_id, user_role')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Validate pagination params
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters', code: 'INVALID_PARAMS' },
        { status: 400 }
      )
    }

    // Fetch patients using service layer (clinic-aware)
    const patients = await getPatients(userRecord.clinic_id, { limit, offset })

    return NextResponse.json(
      { data: patients, status: 200 },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Fetching patients')
      return NextResponse.json(
        { error: errorResponse.message, code: errorResponse.code },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/patients
 * Create a new patient in current clinic
 * 
 * Request body:
 * {
 *   nombre: string (required)
 *   apellido: string (required)
 *   email: string (required)
 *   telefono: string (required)
 *   fechaNacimiento: string (required)
 *   genero: "masculino" | "femenino" | "otro" (required)
 *   direccion: string (optional)
 *   alergias: string[] (optional)
 *   condicionesCronicas: string[] (optional)
 *   grupoSanguineo: string (optional)
 *   avatar: string (optional)
 * }
 * 
 * @requirement API-02
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check authentication
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Get session for clinic_id
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      )
    }

    // Get user profile with clinic_id and role
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('clinic_id, user_role')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check authorization: only staff and admin can create patients
    if (userRecord.user_role === 'doctor') {
      return NextResponse.json(
        { error: 'Doctors cannot create patients', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['nombre', 'apellido', 'email', 'telefono', 'fechaNacimiento', 'genero']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate genero enum
    if (!['masculino', 'femenino', 'otro'].includes(body.genero)) {
      return NextResponse.json(
        { error: 'Invalid genero value', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Prepare patient data
    const patientData: Omit<Patient, 'id' | 'clinicId'> = {
      nombre: body.nombre,
      apellido: body.apellido,
      email: body.email,
      telefono: body.telefono,
      fechaNacimiento: body.fechaNacimiento,
      genero: body.genero,
      direccion: body.direccion || '',
      alergias: Array.isArray(body.alergias) ? body.alergias : [],
      condicionesCronicas: Array.isArray(body.condicionesCronicas) ? body.condicionesCronicas : [],
      grupoSanguineo: body.grupoSanguineo || '',
      fechaRegistro: new Date().toISOString(),
    }

    // Create patient using service layer
    const patient = await createPatientQuery(userRecord.clinic_id, patientData)

    return NextResponse.json(
      { data: patient, status: 201 },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Creating patient')
      return NextResponse.json(
        { error: errorResponse.message, code: errorResponse.code },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
