/**
 * API Service Layer - Clinic-Aware CRUD Functions
 * 
 * This module provides the bridge between frontend pages and the database.
 * Every function:
 * 1. Takes clinic_id as first parameter (from JWT claims)
 * 2. Filters all queries by clinic_id automatically (defense-in-depth with RLS)
 * 3. Calls error handler on any error
 * 4. Returns properly typed results
 * 5. Includes @requirement JSDoc for traceability
 * 
 * Frontend pages should NOT directly import from supabase-queries.ts.
 * Instead, they import these functions which handle clinic isolation,
 * error handling, and type transformation automatically.
 * 
 * @requirement API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10
 * @requirement ERR-01, ERR-02, ERR-03, ERR-04, ERR-05
 */

import {
  Patient,
  Appointment,
  ConsultationNote,
  VitalSigns,
  DoctorProfile,
  MedicalHistory,
  Vaccine,
  MedicalAttachment,
  Clinic,
} from '@/lib/types'
import { handleSupabaseError, isAuthError, isClinicIsolationError } from '@/lib/error-handling'
import * as queries from '@/lib/supabase-queries'

/**
 * Fetch all patients for a clinic
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param options - Optional pagination and sorting
 * @returns Promise resolving to Patient[]
 * 
 * @requirement API-01 (Fetch patients, clinic-aware)
 * @example
 * const patients = await getPatients(clinicId, { limit: 20, offset: 0 })
 */
export async function getPatients(
  clinicId: string,
  options?: { limit?: number; offset?: number }
): Promise<Patient[]> {
  try {
    const { data, error } = await queries.getPatients(clinicId, options)

    if (error) {
      throw handleSupabaseError(error, 'Fetching patients list')
    }

    if (!data) {
      return []
    }

    // Transform database format to Patient interface
    return data.map((row: any) => ({
      id: row.id,
      clinicId: row.clinic_id,
      nombre: row.full_name || row.nombre || '',
      apellido: row.apellido || '',
      email: row.email || '',
      telefono: row.telefono || '',
      fechaNacimiento: row.fecha_nacimiento || row.fechaNacimiento || '',
      genero: row.genero || 'otro',
      direccion: row.direccion || '',
      alergias: row.alergias || [],
      condicionesCronicas: row.condiciones_cronicas || row.condicionesCronicas || [],
      grupoSanguineo: row.grupo_sanguineo || row.grupoSanguineo || '',
      avatar: row.avatar,
      fechaRegistro: row.fecha_registro || row.fechaRegistro || new Date().toISOString(),
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Fetching patients list')
    throw new Error(error.message)
  }
}

/**
 * Fetch a single patient by ID with clinic isolation check
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - The patient ID
 * @returns Promise resolving to Patient
 * 
 * @requirement API-01 (Fetch patient details)
 * @throws Error if patient not found or belongs to different clinic
 */
export async function getPatientById(
  clinicId: string,
  patientId: string
): Promise<Patient> {
  try {
    const { data, error } = await queries.getPatientById(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, `Fetching patient ${patientId}`)
    }

    if (!data) {
      throw new Error('Patient not found')
    }

    return {
      id: data.id,
      clinicId: data.clinic_id,
      nombre: data.full_name || data.nombre || '',
      apellido: data.apellido || '',
      email: data.email || '',
      telefono: data.telefono || '',
      fechaNacimiento: data.fecha_nacimiento || data.fechaNacimiento || '',
      genero: data.genero || 'otro',
      direccion: data.direccion || '',
      alergias: data.alergias || [],
      condicionesCronicas: data.condiciones_cronicas || data.condicionesCronicas || [],
      grupoSanguineo: data.grupo_sanguineo || data.grupoSanguineo || '',
      avatar: data.avatar,
      fechaRegistro: data.fecha_registro || data.fechaRegistro || '',
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Fetching patient ${patientId}`)
    throw new Error(error.message)
  }
}

/**
 * Create a new patient in the clinic
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param data - Patient data (id and clinicId will be added by service)
 * @returns Promise resolving to created Patient
 * 
 * @requirement API-07 (Create new patient)
 * @throws Error if validation fails or clinic isolation error
 */
export async function createPatient(
  clinicId: string,
  data: Omit<Patient, 'id' | 'clinicId'>
): Promise<Patient> {
  try {
    const { data: result, error } = await queries.createPatient(clinicId, data)

    if (error) {
      throw handleSupabaseError(error, 'Creating patient')
    }

    if (!result) {
      throw new Error('Failed to create patient')
    }

    return {
      id: result.id,
      clinicId: result.clinic_id,
      nombre: result.full_name || result.nombre || '',
      apellido: result.apellido || '',
      email: result.email || '',
      telefono: result.telefono || '',
      fechaNacimiento: result.fecha_nacimiento || result.fechaNacimiento || '',
      genero: result.genero || 'otro',
      direccion: result.direccion || '',
      alergias: result.alergias || [],
      condicionesCronicas: result.condiciones_cronicas || result.condicionesCronicas || [],
      grupoSanguineo: result.grupo_sanguineo || result.grupoSanguineo || '',
      avatar: result.avatar,
      fechaRegistro: result.fecha_registro || result.fechaRegistro || new Date().toISOString(),
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Creating patient')
    throw new Error(error.message)
  }
}

/**
 * Update a patient in the clinic
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - The patient ID to update
 * @param data - Partial patient data to update
 * @returns Promise resolving to updated Patient
 * 
 * @requirement API-08 (Update patient)
 * @throws Error if patient not found or clinic isolation error
 */
export async function updatePatient(
  clinicId: string,
  patientId: string,
  data: Partial<Omit<Patient, 'id' | 'clinicId'>>
): Promise<Patient> {
  try {
    const { data: result, error } = await queries.updatePatient(clinicId, patientId, data)

    if (error) {
      throw handleSupabaseError(error, `Updating patient ${patientId}`)
    }

    if (!result) {
      throw new Error('Patient not found')
    }

    return {
      id: result.id,
      clinicId: result.clinic_id,
      nombre: result.full_name || result.nombre || '',
      apellido: result.apellido || '',
      email: result.email || '',
      telefono: result.telefono || '',
      fechaNacimiento: result.fecha_nacimiento || result.fechaNacimiento || '',
      genero: result.genero || 'otro',
      direccion: result.direccion || '',
      alergias: result.alergias || [],
      condicionesCronicas: result.condiciones_cronicas || result.condicionesCronicas || [],
      grupoSanguineo: result.grupo_sanguineo || result.grupoSanguineo || '',
      avatar: result.avatar,
      fechaRegistro: result.fecha_registro || result.fechaRegistro || '',
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Updating patient ${patientId}`)
    throw new Error(error.message)
  }
}

/**
 * Delete a patient from the clinic (cascades to related records)
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - The patient ID to delete
 * @returns Promise that resolves when deletion is complete
 * 
 * @requirement API-09 (Delete patient)
 * @throws Error if patient not found or clinic isolation error
 */
export async function deletePatient(clinicId: string, patientId: string): Promise<void> {
  try {
    const { error } = await queries.deletePatient(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, `Deleting patient ${patientId}`)
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Deleting patient ${patientId}`)
    throw new Error(error.message)
  }
}

/**
 * Fetch all appointments for a clinic within optional date range
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - Optional patient ID to filter by
 * @returns Promise resolving to Appointment[]
 * 
 * @requirement API-02 (Fetch appointments, clinic-aware)
 * @example
 * const allAppointments = await getAppointments(clinicId)
 * 
 * @example
 * const patientAppointments = await getAppointments(clinicId, patientId)
 */
export async function getAppointments(
  clinicId: string,
  patientId?: string
): Promise<Appointment[]> {
  try {
    const { data, error } = await queries.getAppointments(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, 'Fetching appointments')
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      clinicId: row.clinic_id,
      pacienteId: row.paciente_id,
      fecha: row.fecha || '',
      hora: row.hora || '',
      duracion: row.duracion || 30,
      tipo: row.tipo || 'consulta',
      estado: row.estado || 'programada',
      motivo: row.motivo || '',
      notas: row.notas,
      creadoPorBot: row.creado_por_bot || false,
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Fetching appointments')
    throw new Error(error.message)
  }
}

/**
 * Fetch a single appointment by ID
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param appointmentId - The appointment ID
 * @returns Promise resolving to Appointment
 * 
 * @requirement API-02 (Fetch appointment details)
 */
export async function getAppointmentById(
  clinicId: string,
  appointmentId: string
): Promise<Appointment> {
  try {
    const { data, error } = await queries.getAppointmentById(clinicId, appointmentId)

    if (error) {
      throw handleSupabaseError(error, `Fetching appointment ${appointmentId}`)
    }

    if (!data) {
      throw new Error('Appointment not found')
    }

    return {
      id: data.id,
      clinicId: data.clinic_id,
      pacienteId: data.paciente_id,
      fecha: data.fecha || '',
      hora: data.hora || '',
      duracion: data.duracion || 30,
      tipo: data.tipo || 'consulta',
      estado: data.estado || 'programada',
      motivo: data.motivo || '',
      notas: data.notas,
      creadoPorBot: data.creado_por_bot || false,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Fetching appointment ${appointmentId}`)
    throw new Error(error.message)
  }
}

/**
 * Create a new appointment in the clinic
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param data - Appointment data (id and clinicId will be added by service)
 * @returns Promise resolving to created Appointment
 * 
 * @requirement API-07 (Create new appointment)
 */
export async function createAppointment(
  clinicId: string,
  data: Omit<Appointment, 'id' | 'clinicId'>
): Promise<Appointment> {
  try {
    const { data: result, error } = await queries.createAppointment(clinicId, data)

    if (error) {
      throw handleSupabaseError(error, 'Creating appointment')
    }

    if (!result) {
      throw new Error('Failed to create appointment')
    }

    return {
      id: result.id,
      clinicId: result.clinic_id,
      pacienteId: result.paciente_id,
      fecha: result.fecha || '',
      hora: result.hora || '',
      duracion: result.duracion || 30,
      tipo: result.tipo || 'consulta',
      estado: result.estado || 'programada',
      motivo: result.motivo || '',
      notas: result.notas,
      creadoPorBot: result.creado_por_bot || false,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Creating appointment')
    throw new Error(error.message)
  }
}

/**
 * Update an appointment in the clinic
 * 
 * Verifies clinic_id in WHERE clause to prevent cross-clinic updates.
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param appointmentId - The appointment ID to update
 * @param data - Partial appointment data to update
 * @returns Promise resolving to updated Appointment
 * 
 * @requirement API-08 (Update appointment)
 */
export async function updateAppointment(
  clinicId: string,
  appointmentId: string,
  data: Partial<Omit<Appointment, 'id' | 'clinicId'>>
): Promise<Appointment> {
  try {
    const { data: result, error } = await queries.updateAppointment(clinicId, appointmentId, data)

    if (error) {
      throw handleSupabaseError(error, `Updating appointment ${appointmentId}`)
    }

    if (!result) {
      throw new Error('Appointment not found')
    }

    return {
      id: result.id,
      clinicId: result.clinic_id,
      pacienteId: result.paciente_id,
      fecha: result.fecha || '',
      hora: result.hora || '',
      duracion: result.duracion || 30,
      tipo: result.tipo || 'consulta',
      estado: result.estado || 'programada',
      motivo: result.motivo || '',
      notas: result.notas,
      creadoPorBot: result.creado_por_bot || false,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Updating appointment ${appointmentId}`)
    throw new Error(error.message)
  }
}

/**
 * Delete an appointment from the clinic
 * 
 * Verifies clinic_id in WHERE clause to prevent cross-clinic deletes.
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param appointmentId - The appointment ID to delete
 * @returns Promise that resolves when deletion is complete
 * 
 * @requirement API-09 (Delete appointment)
 */
export async function deleteAppointment(
  clinicId: string,
  appointmentId: string
): Promise<void> {
  try {
    const { error } = await queries.deleteAppointment(clinicId, appointmentId)

    if (error) {
      throw handleSupabaseError(error, `Deleting appointment ${appointmentId}`)
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Deleting appointment ${appointmentId}`)
    throw new Error(error.message)
  }
}

/**
 * Fetch vital signs for a specific patient
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - The patient ID
 * @returns Promise resolving to VitalSigns[]
 * 
 * @requirement API-04 (Fetch vital signs per patient)
 * @example
 * const vitals = await getVitalSigns(clinicId, patientId)
 */
export async function getVitalSigns(
  clinicId: string,
  patientId: string
): Promise<VitalSigns[]> {
  try {
    const { data, error } = await queries.getVitalSigns(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, `Fetching vital signs for patient ${patientId}`)
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      pacienteId: row.paciente_id,
      citaId: row.cita_id,
      fecha: row.fecha || '',
      presionSistolica: row.presion_sistolica || 0,
      presionDiastolica: row.presion_diastolica || 0,
      frecuenciaCardiaca: row.frecuencia_cardiaca || 0,
      temperatura: row.temperatura || 0,
      peso: row.peso || 0,
      talla: row.talla || 0,
      saturacionOxigeno: row.saturacion_oxigeno,
      glucosa: row.glucosa,
      notas: row.notas,
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Fetching vital signs for patient ${patientId}`)
    throw new Error(error.message)
  }
}

/**
 * Create a new vital signs record for a patient
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param data - Vital signs data
 * @returns Promise resolving to created VitalSigns
 * 
 * @requirement API-07 (Create vital signs)
 */
export async function createVitalSigns(
  clinicId: string,
  data: Omit<VitalSigns, 'id'>
): Promise<VitalSigns> {
  try {
    const { data: result, error } = await queries.createVitalSign(clinicId, data)

    if (error) {
      throw handleSupabaseError(error, 'Creating vital signs')
    }

    if (!result) {
      throw new Error('Failed to create vital signs')
    }

    return {
      id: result.id,
      pacienteId: result.paciente_id,
      citaId: result.cita_id,
      fecha: result.fecha || '',
      presionSistolica: result.presion_sistolica || 0,
      presionDiastolica: result.presion_diastolica || 0,
      frecuenciaCardiaca: result.frecuencia_cardiaca || 0,
      temperatura: result.temperatura || 0,
      peso: result.peso || 0,
      talla: result.talla || 0,
      saturacionOxigeno: result.saturacion_oxigeno,
      glucosa: result.glucosa,
      notas: result.notas,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Creating vital signs')
    throw new Error(error.message)
  }
}

/**
 * Update vital signs record
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param vitalSignsId - The vital signs ID to update
 * @param data - Partial vital signs data to update
 * @returns Promise resolving to updated VitalSigns
 * 
 * @requirement API-08 (Update vital signs)
 */
export async function updateVitalSigns(
  clinicId: string,
  vitalSignsId: string,
  data: Partial<Omit<VitalSigns, 'id'>>
): Promise<VitalSigns> {
  try {
    const { data: result, error } = await queries.updateVitalSign(clinicId, vitalSignsId, data)

    if (error) {
      throw handleSupabaseError(error, `Updating vital signs ${vitalSignsId}`)
    }

    if (!result) {
      throw new Error('Vital signs record not found')
    }

    return {
      id: result.id,
      pacienteId: result.paciente_id,
      citaId: result.cita_id,
      fecha: result.fecha || '',
      presionSistolica: result.presion_sistolica || 0,
      presionDiastolica: result.presion_diastolica || 0,
      frecuenciaCardiaca: result.frecuencia_cardiaca || 0,
      temperatura: result.temperatura || 0,
      peso: result.peso || 0,
      talla: result.talla || 0,
      saturacionOxigeno: result.saturacion_oxigeno,
      glucosa: result.glucosa,
      notas: result.notas,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Updating vital signs ${vitalSignsId}`)
    throw new Error(error.message)
  }
}

/**
 * Fetch consultation notes for a clinic (optionally filtered by patient)
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - Optional patient ID to filter by
 * @returns Promise resolving to ConsultationNote[]
 * 
 * @requirement API-03 (Fetch consultation notes)
 */
export async function getConsultationNotes(
  clinicId: string,
  patientId?: string
): Promise<ConsultationNote[]> {
  try {
    const { data, error } = await queries.getConsultationNotes(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, 'Fetching consultation notes')
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      clinicId: row.clinic_id,
      pacienteId: row.paciente_id,
      citaId: row.cita_id,
      fecha: row.fecha || '',
      diagnostico: row.diagnostico || '',
      sintomas: row.sintomas || [],
      tratamiento: row.tratamiento || '',
      recetas: row.recetas || [],
      observaciones: row.observaciones || '',
      doctorId: row.doctor_id || '',
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Fetching consultation notes')
    throw new Error(error.message)
  }
}

/**
 * Create a new consultation note
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param data - Consultation note data
 * @returns Promise resolving to created ConsultationNote
 * 
 * @requirement API-07 (Create consultation note)
 */
export async function createConsultationNote(
  clinicId: string,
  data: Omit<ConsultationNote, 'id' | 'clinicId'>
): Promise<ConsultationNote> {
  try {
    const { data: result, error } = await queries.createConsultationNote(clinicId, data)

    if (error) {
      throw handleSupabaseError(error, 'Creating consultation note')
    }

    if (!result) {
      throw new Error('Failed to create consultation note')
    }

    return {
      id: result.id,
      clinicId: result.clinic_id,
      pacienteId: result.paciente_id,
      citaId: result.cita_id,
      fecha: result.fecha || '',
      diagnostico: result.diagnostico || '',
      sintomas: result.sintomas || [],
      tratamiento: result.tratamiento || '',
      recetas: result.recetas || [],
      observaciones: result.observaciones || '',
      doctorId: result.doctor_id || '',
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Creating consultation note')
    throw new Error(error.message)
  }
}

/**
 * Fetch medical attachments for a clinic (optionally filtered by patient)
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - Optional patient ID to filter by
 * @returns Promise resolving to MedicalAttachment[]
 * 
 * @requirement API-05 (Fetch medical attachments)
 */
export async function getAttachments(
  clinicId: string,
  patientId?: string
): Promise<MedicalAttachment[]> {
  try {
    const { data, error } = await queries.getAttachments(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, 'Fetching medical attachments')
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      clinicId: row.clinic_id,
      pacienteId: row.paciente_id,
      tipo: row.tipo || 'documento',
      nombre: row.nombre || '',
      fecha: row.fecha || '',
      url: row.url || '',
      descripcion: row.descripcion,
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Fetching medical attachments')
    throw new Error(error.message)
  }
}

/**
 * Create a new medical attachment
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param data - Attachment data
 * @returns Promise resolving to created MedicalAttachment
 * 
 * @requirement API-07 (Create medical attachment)
 */
export async function createAttachment(
  clinicId: string,
  data: Omit<MedicalAttachment, 'id' | 'clinicId'>
): Promise<MedicalAttachment> {
  try {
    const { data: result, error } = await queries.createAttachment(clinicId, data)

    if (error) {
      throw handleSupabaseError(error, 'Creating medical attachment')
    }

    if (!result) {
      throw new Error('Failed to create attachment')
    }

    return {
      id: result.id,
      clinicId: result.clinic_id,
      pacienteId: result.paciente_id,
      tipo: result.tipo || 'documento',
      nombre: result.nombre || '',
      fecha: result.fecha || '',
      url: result.url || '',
      descripcion: result.descripcion,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Creating medical attachment')
    throw new Error(error.message)
  }
}

/**
 * Fetch doctor profiles for a clinic
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @returns Promise resolving to DoctorProfile[]
 * 
 * @requirement API-06 (Fetch doctor profiles)
 */
export async function getDoctorProfiles(clinicId: string): Promise<DoctorProfile[]> {
  try {
    const { data, error } = await queries.getDoctors(clinicId)

    if (error) {
      throw handleSupabaseError(error, 'Fetching doctor profiles')
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      nombre: row.nombre || row.full_name || '',
      especialidad: row.especialidad || '',
      email: row.email || '',
      telefono: row.telefono || '',
      horarioInicio: row.horario_inicio || '',
      horarioFin: row.horario_fin || '',
      diasLaborales: row.dias_laborales || [1, 2, 3, 4, 5],
      duracionCitaDefault: row.duracion_cita_default || 30,
      avatar: row.avatar,
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, 'Fetching doctor profiles')
    throw new Error(error.message)
  }
}

/**
 * Verify if a user has access to a clinic
 * 
 * This function checks the JWT claims to verify that the user
 * is assigned to the specified clinic. This is for explicit verification
 * in addition to RLS enforcement.
 * 
 * @param clinicId - The clinic ID to check access for
 * @param userClinicId - The clinic ID from JWT claims (from useAuth hook)
 * @returns Promise<boolean> - true if user has access, false otherwise
 * 
 * @requirement API-10 (Enforce clinic context)
 * @example
 * const { user } = useAuth()
 * if (await verifyClinicAccess(clinicId, user?.clinic_id)) {
 *   // User has access, safe to query
 * } else {
 *   // User does not have access to this clinic
 *   throw new Error('Access denied')
 * }
 */
export async function verifyClinicAccess(
  clinicId: string,
  userClinicId?: string
): Promise<boolean> {
  // If no user clinic ID provided, access denied
  if (!userClinicId) {
    return false
  }

  // Verify clinic IDs match (JWT claims are server-verified)
  return clinicId === userClinicId
}

/**
 * Type-safe fetch medical history for a patient
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - The patient ID
 * @returns Promise resolving to MedicalHistory[]
 * 
 * @requirement API-03 (Fetch patient medical history)
 */
export async function getMedicalHistory(
  clinicId: string,
  patientId: string
): Promise<MedicalHistory[]> {
  try {
    const { data, error } = await queries.getMedicalHistory(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, `Fetching medical history for patient ${patientId}`)
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      pacienteId: row.paciente_id,
      tipo: row.tipo || 'personal',
      categoria: row.categoria || 'enfermedad',
      descripcion: row.descripcion || '',
      fecha: row.fecha,
      parentesco: row.parentesco,
      notas: row.notas,
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Fetching medical history for patient ${patientId}`)
    throw new Error(error.message)
  }
}

/**
 * Fetch vaccine records for a patient
 * 
 * @param clinicId - The clinic ID (from JWT claims)
 * @param patientId - The patient ID
 * @returns Promise resolving to Vaccine[]
 * 
 * @requirement API-03 (Fetch vaccine records)
 */
export async function getVaccineRecords(
  clinicId: string,
  patientId: string
): Promise<Vaccine[]> {
  try {
    const { data, error } = await queries.getVaccineRecords(clinicId, patientId)

    if (error) {
      throw handleSupabaseError(error, `Fetching vaccine records for patient ${patientId}`)
    }

    if (!data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      pacienteId: row.paciente_id,
      nombre: row.nombre || '',
      fecha: row.fecha || '',
      dosis: row.dosis,
      lote: row.lote,
      proximaDosis: row.proxima_dosis,
      aplicadoPor: row.aplicado_por,
      notas: row.notas,
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Fetching vaccine records for patient ${patientId}`)
    throw new Error(error.message)
  }
}
