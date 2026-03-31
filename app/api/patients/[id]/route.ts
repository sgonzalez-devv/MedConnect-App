/**
 * GET /api/patients/[id] - Fetch single patient
 * PATCH /api/patients/[id] - Update patient
 * DELETE /api/patients/[id] - Delete patient
 * 
 * @requirement API-01, API-02
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { handleSupabaseError, isAuthError, isClinicIsolationError } from '@/lib/error-handling'
import {
  getPatientById,
  updatePatient as updatePatientService,
  deletePatient as deletePatientService,
} from '@/lib/api-service'
import type { Patient } from '@/lib/types'

/**
 * Helper to extract user clinic context
 */
async function getUserClinicContext(
  request: NextRequest
): Promise<{ clinic_id: string; user_role: string } | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Read clinic_id and user_role from JWT metadata (set during user creation)
  const clinic_id = user.user_metadata?.clinic_id
  const user_role = user.user_metadata?.user_role

  if (!clinic_id || !user_role) {
    return null
  }

  return { clinic_id, user_role }
}

/**
 * GET /api/patients/[id]
 * Fetch single patient by ID with clinic isolation verification
 * 
 * @requirement API-01
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clinicContext = await getUserClinicContext(request)

    if (!clinicContext) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Validate ID format (basic UUID validation)
    if (!id || id.length < 8) {
      return NextResponse.json(
        { error: 'Invalid patient ID', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Fetch patient with clinic isolation
    const patient = await getPatientById(clinicContext.clinic_id, id)

    return NextResponse.json(
      { data: patient, status: 200 },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      // Check for clinic isolation error
      if (isClinicIsolationError(error) || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Patient not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Fetching patient')
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
 * PATCH /api/patients/[id]
 * Update patient (partial update allowed)
 * 
 * Request body: Partial<Patient> (any subset of fields except id, clinicId)
 * 
 * @requirement API-02
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clinicContext = await getUserClinicContext(request)

    if (!clinicContext) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: only staff and admin can update
    if (clinicContext.user_role === 'doctor') {
      return NextResponse.json(
        { error: 'Doctors cannot update patients', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validate ID
    if (!id || id.length < 8) {
      return NextResponse.json(
        { error: 'Invalid patient ID', code: 'INVALID_ID' },
        { status: 400 }
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

    // Validate body is not empty
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Request body cannot be empty', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Prevent updating immutable fields
    const immutableFields = ['id', 'clinic_id', 'created_at']
    for (const field of immutableFields) {
      if (field in body) {
        return NextResponse.json(
          { error: `Cannot update immutable field: ${field}`, code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
    }

    // Validate email if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
    }

    // Update patient using service layer
    const patient = await updatePatientService(clinicContext.clinic_id, id, body)

    return NextResponse.json(
      { data: patient, status: 200 },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      // Check for clinic isolation error
      if (isClinicIsolationError(error) || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Patient not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Updating patient')
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
 * DELETE /api/patients/[id]
 * Delete patient and all associated records (appointments, notes, vital signs, etc.)
 * 
 * Note: Due to RLS policies and clinic isolation, this will only delete if user
 * belongs to same clinic. Database cascading deletes related records.
 * 
 * @requirement API-02
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clinicContext = await getUserClinicContext(request)

    if (!clinicContext) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: only admin can delete
    if (clinicContext.user_role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Only administrators can delete patients',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validate ID
    if (!id || id.length < 8) {
      return NextResponse.json(
        { error: 'Invalid patient ID', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Verify patient exists and belongs to clinic before deleting
    try {
      await getPatientById(clinicContext.clinic_id, id)
    } catch {
      return NextResponse.json(
        { error: 'Patient not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Delete patient using service layer
    await deletePatientService(clinicContext.clinic_id, id)

    // Return 204 No Content on successful deletion
    return NextResponse.json(
      { data: null, status: 204 },
      { status: 204 }
    )
  } catch (error) {
    if (error instanceof Error) {
      // Check for clinic isolation error
      if (isClinicIsolationError(error) || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Patient not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Deleting patient')
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
