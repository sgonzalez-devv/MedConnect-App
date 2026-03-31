/**
 * GET /api/appointments - Fetch appointments for current clinic
 * POST /api/appointments - Create new appointment
 * 
 * @requirement API-03, API-04
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { handleSupabaseError, isAuthError } from '@/lib/error-handling'
import {
  getAppointments,
  createAppointment as createAppointmentService,
} from '@/lib/api-service'
import type { Appointment } from '@/lib/types'

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
 * GET /api/appointments
 * Fetch appointments for current clinic
 * 
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 * - patientId: string (optional, filter by patient)
 * - fromDate: ISO string (optional, filter by start date)
 * - toDate: ISO string (optional, filter by end date)
 * 
 * @requirement API-03
 */
export async function GET(request: NextRequest) {
  try {
    const clinicContext = await getUserClinicContext(request)

    if (!clinicContext) {
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
    // Note: Service layer handles basic filtering; additional date filtering
    // can be done in post-processing or extended in api-service layer
    const appointments = await getAppointments(clinicContext.clinic_id, patientId)

    // Apply date filtering in-memory if dates provided
    let filtered = appointments
    if (fromDate || toDate) {
      const fromDateTime = fromDate ? new Date(fromDate).getTime() : 0
      const toDateTime = toDate ? new Date(toDate).getTime() : Number.MAX_VALUE

      filtered = appointments.filter(apt => {
        const aptDateTime = new Date(`${apt.fecha}T${apt.hora}`).getTime()
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
 *   pacienteId: string (required)
 *   fecha: string (required, YYYY-MM-DD format)
 *   hora: string (required, HH:MM format)
 *   duracion: number (required, minutes)
 *   tipo: "consulta" | "seguimiento" | "urgencia" | "revision" (required)
 *   motivo: string (required)
 *   notas: string (optional)
 *   estado: string (optional, default "programada")
 *   creadoPorBot: boolean (optional, default false)
 * }
 * 
 * @requirement API-04
 */
export async function POST(request: NextRequest) {
  try {
    const clinicContext = await getUserClinicContext(request)

    if (!clinicContext) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Check authorization: staff and doctors can create, admin too
    if (clinicContext.user_role === 'patient') {
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
    const requiredFields = ['pacienteId', 'fecha', 'hora', 'duracion', 'tipo', 'motivo']
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

    // Validate fecha format (YYYY-MM-DD)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(body.fecha)) {
      return NextResponse.json(
        { error: 'Invalid fecha format, expected YYYY-MM-DD', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate hora format (HH:MM)
    const horaRegex = /^\d{2}:\d{2}$/
    if (!horaRegex.test(body.hora)) {
      return NextResponse.json(
        { error: 'Invalid hora format, expected HH:MM', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate duracion is positive number
    const duracion = parseInt(body.duracion)
    if (isNaN(duracion) || duracion < 5) {
      return NextResponse.json(
        { error: 'Duration must be at least 5 minutes', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate tipo enum
    if (!['consulta', 'seguimiento', 'urgencia', 'revision'].includes(body.tipo)) {
      return NextResponse.json(
        { error: 'Invalid appointment type', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Prepare appointment data
    const appointmentData: Omit<Appointment, 'id' | 'clinicId'> = {
      pacienteId: body.pacienteId,
      fecha: body.fecha,
      hora: body.hora,
      duracion,
      tipo: body.tipo,
      estado: body.estado || 'programada',
      motivo: body.motivo,
      notas: body.notas || undefined,
      creadoPorBot: body.creadoPorBot === true,
    }

    // Create appointment using service layer
    const appointment = await createAppointmentService(
      clinicContext.clinic_id,
      appointmentData
    )

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
