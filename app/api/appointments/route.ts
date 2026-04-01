/**
 * GET /api/appointments - Fetch appointments for current clinic
 * POST /api/appointments - Create new appointment
 * 
 * @requirement API-03, API-04
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleSupabaseError, isAuthError } from '@/lib/error-handling'
import { getClinicContext } from '@/lib/auth-context'
import {
  getAppointments,
  createAppointment as createAppointmentService,
} from '@/lib/api-service'
import type { Appointment } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
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
    const patientId = url.searchParams.get('patientId') || undefined
    const fromDate = url.searchParams.get('fromDate') || undefined
    const toDate = url.searchParams.get('toDate') || undefined

    // Validate pagination params
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters', code: 'INVALID_PARAMS' },
        { status: 400 }
      )
    }

    // Validate date params if provided
    if (fromDate && isNaN(Date.parse(fromDate))) {
      return NextResponse.json(
        { error: 'Invalid fromDate format', code: 'INVALID_PARAMS' },
        { status: 400 }
      )
    }

    if (toDate && isNaN(Date.parse(toDate))) {
      return NextResponse.json(
        { error: 'Invalid toDate format', code: 'INVALID_PARAMS' },
        { status: 400 }
      )
    }

    // Fetch appointments using service layer
    const appointments = await getAppointments(ctx.clinic_id, patientId)

    // Apply date filtering in-memory if dates provided
    let filtered = appointments
    if (fromDate || toDate) {
      const fromDateTime = fromDate ? new Date(fromDate).getTime() : 0
      const toDateTime = toDate ? new Date(toDate).getTime() : Number.MAX_VALUE

      filtered = appointments.filter(apt => {
        const aptDateTime = apt.appointment_datetime ? new Date(apt.appointment_datetime).getTime() : 0
        return aptDateTime >= fromDateTime && aptDateTime <= toDateTime
      })
    }

    return NextResponse.json(
      { data: filtered, status: 200 },
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

      const errorResponse = handleSupabaseError(error, 'Fetching appointments')
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
 * POST /api/appointments
 * Create a new appointment in current clinic
 * 
 * Request body:
 * {
 *   patient_id: string (required)
 *   appointment_datetime: string (required, ISO 8601 format)
 *   duration_minutes: number (required, minutes)
 *   reason_for_visit: string (required)
 *   notes: string (optional)
 *   status: string (optional, default "scheduled")
 *   doctor_id: string (optional)
 * }
 * 
 * @requirement API-04
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getClinicContext()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: staff and doctors can create, admin too
    if ((ctx.user_role as string) === 'patient') {
      return NextResponse.json(
        { error: 'Patients cannot create appointments directly', code: 'FORBIDDEN' },
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
    const requiredFields = ['patient_id', 'appointment_datetime', 'duration_minutes', 'reason_for_visit']
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

    // Validate appointment_datetime format (ISO 8601)
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/
    if (!datetimeRegex.test(body.appointment_datetime)) {
      return NextResponse.json(
        { error: 'Invalid appointment_datetime format, expected ISO 8601 (YYYY-MM-DDTHH:MM)', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate duration_minutes is positive number
    const duration_minutes = parseInt(body.duration_minutes)
    if (isNaN(duration_minutes) || duration_minutes < 5) {
      return NextResponse.json(
        { error: 'Duration must be at least 5 minutes', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Prepare appointment data
    const appointmentData: Omit<Appointment, 'id' | 'clinic_id'> = {
      patient_id: body.patient_id,
      appointment_datetime: body.appointment_datetime,
      duration_minutes,
      status: body.status || 'scheduled',
      reason_for_visit: body.reason_for_visit,
      notes: body.notes || undefined,
      doctor_id: body.doctor_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Create appointment using service layer
    const appointment = await createAppointmentService(ctx.clinic_id, appointmentData)

    return NextResponse.json(
      { data: appointment, status: 201 },
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

      const errorResponse = handleSupabaseError(error, 'Creating appointment')
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
