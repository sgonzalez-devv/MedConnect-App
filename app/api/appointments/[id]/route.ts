/**
 * GET /api/appointments/[id] - Fetch single appointment
 * PATCH /api/appointments/[id] - Update appointment
 * DELETE /api/appointments/[id] - Delete appointment
 * 
 * @requirement API-03, API-04
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleSupabaseError, isAuthError, isClinicIsolationError } from '@/lib/error-handling'
import { getClinicContext } from '@/lib/auth-context'
import {
  getAppointmentById,
  updateAppointment as updateAppointmentService,
  deleteAppointment as deleteAppointmentService,
} from '@/lib/api-service'
import type { Appointment } from '@/lib/types'

/**
 * GET /api/appointments/[id]
 * Fetch single appointment by ID with clinic isolation verification
 * 
 * @requirement API-03
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getClinicContext()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Validate ID format
    if (!id || id.length < 8) {
      return NextResponse.json(
        { error: 'Invalid appointment ID', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Fetch appointment with clinic isolation
    const appointment = await getAppointmentById(ctx.clinic_id, id)

    return NextResponse.json(
      { data: appointment, status: 200 },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (isClinicIsolationError(error) || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Appointment not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Fetching appointment')
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
 * PATCH /api/appointments/[id]
 * Update appointment (partial update allowed)
 * 
 * Request body: Partial<Appointment> (any subset of fields except id, clinicId)
 * 
 * @requirement API-04
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getClinicContext()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: doctors, staff and admin can update
    if ((ctx.user_role as string) === 'patient') {
      return NextResponse.json(
        { error: 'Patients cannot update appointments', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validate ID
    if (!id || id.length < 8) {
      return NextResponse.json(
        { error: 'Invalid appointment ID', code: 'INVALID_ID' },
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
    const immutableFields = ['id', 'clinic_id', 'patient_id', 'created_at']
    for (const field of immutableFields) {
      if (field in body) {
        return NextResponse.json(
          { error: `Cannot update immutable field: ${field}`, code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
    }

    // Validate status enum if provided
    if (body.status && !['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid appointment status', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate appointment_datetime format if provided (ISO 8601)
    if (body.appointment_datetime) {
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/
      if (!datetimeRegex.test(body.appointment_datetime)) {
        return NextResponse.json(
          { error: 'Invalid appointment_datetime format, expected ISO 8601 (YYYY-MM-DDTHH:MM)', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
    }

    // Validate duration_minutes if provided
    if (body.duration_minutes !== undefined) {
      const duration = parseInt(body.duration_minutes)
      if (isNaN(duration) || duration < 5) {
        return NextResponse.json(
          { error: 'Duration must be at least 5 minutes', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
    }

    // Update appointment using service layer
    const appointment = await updateAppointmentService(ctx.clinic_id, id, body)

    return NextResponse.json(
      { data: appointment, status: 200 },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (isClinicIsolationError(error) || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Appointment not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Updating appointment')
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
 * DELETE /api/appointments/[id]
 * Delete appointment from the clinic
 * 
 * Note: Due to RLS policies and clinic isolation, this will only delete if user
 * belongs to same clinic.
 * 
 * @requirement API-04
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getClinicContext()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: staff and admin can delete
    if ((ctx.user_role as string) === 'patient') {
      return NextResponse.json(
        {
          error: 'Patients cannot delete appointments',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validate ID
    if (!id || id.length < 8) {
      return NextResponse.json(
        { error: 'Invalid appointment ID', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Verify appointment exists and belongs to clinic before deleting
    try {
      await getAppointmentById(ctx.clinic_id, id)
    } catch {
      return NextResponse.json(
        { error: 'Appointment not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Delete appointment using service layer
    await deleteAppointmentService(ctx.clinic_id, id)

    // Return 204 No Content on successful deletion
    return NextResponse.json(
      { data: null, status: 204 },
      { status: 204 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (isClinicIsolationError(error) || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Appointment not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      if (isAuthError(error)) {
        return NextResponse.json(
          { error: 'Authentication failed', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }

      const errorResponse = handleSupabaseError(error, 'Deleting appointment')
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
