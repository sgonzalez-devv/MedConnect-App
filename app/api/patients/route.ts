/**
 * GET /api/patients - Fetch all patients for current user's clinic
 * POST /api/patients - Create new patient in current user's clinic
 * 
 * @requirement API-01, API-02
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleSupabaseError, isAuthError } from '@/lib/error-handling'
import { getClinicContext } from '@/lib/auth-context'
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
    // Get authenticated user's clinic context (reads user_metadata / app_metadata)
    const ctx = await getClinicContext()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
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
    const patients = await getPatients(ctx.clinic_id, { limit, offset })

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
 *   full_name: string (required)
 *   email: string (required)
 *   phone: string (required)
 *   date_of_birth: string (required, YYYY-MM-DD)
 *   gender: string (required)
 *   address: string (optional)
 * }
 * 
 * @requirement API-02
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user's clinic context (reads user_metadata / app_metadata)
    const ctx = await getClinicContext()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: only staff and admin can create patients
    if (ctx.user_role === 'doctor') {
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
    const requiredFields = ['full_name', 'email', 'phone', 'date_of_birth', 'gender']
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

    // Prepare patient data
    const patientData: Omit<Patient, 'id' | 'clinic_id'> = {
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      address: body.address || null,
      city: null,
      state: null,
      zip_code: null,
      country: null,
      id_document: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      notes: null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Create patient using service layer
    const patient = await createPatientQuery(ctx.clinic_id, patientData)

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
