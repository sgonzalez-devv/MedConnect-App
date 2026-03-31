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
  VaccineRecord,
  Attachment,
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

    return data.map((row: any) => ({
      id: row.id,
      clinic_id: row.clinic_id,
      full_name: row.full_name || '',
      date_of_birth: row.date_of_birth || null,
      gender: row.gender || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
      city: row.city || null,
      state: row.state || null,
      zip_code: row.zip_code || null,
      country: row.country || null,
      id_document: row.id_document || null,
      emergency_contact_name: row.emergency_contact_name || null,
      emergency_contact_phone: row.emergency_contact_phone || null,
      notes: row.notes || null,
      status: row.status || 'active',
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
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
      clinic_id: data.clinic_id,
      full_name: data.full_name || '',
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      country: data.country || null,
      id_document: data.id_document || null,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
      notes: data.notes || null,
      status: data.status || 'active',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
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
 * @param data - Patient data (id and clinic_id will be added by service)
 * @returns Promise resolving to created Patient
 * 
 * @requirement API-07 (Create new patient)
 * @throws Error if validation fails or clinic isolation error
 */
export async function createPatient(
  clinicId: string,
  data: Omit<Patient, 'id' | 'clinic_id'>
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
      clinic_id: result.clinic_id,
      full_name: result.full_name || '',
      date_of_birth: result.date_of_birth || null,
      gender: result.gender || null,
      email: result.email || null,
      phone: result.phone || null,
      address: result.address || null,
      city: result.city || null,
      state: result.state || null,
      zip_code: result.zip_code || null,
      country: result.country || null,
      id_document: result.id_document || null,
      emergency_contact_name: result.emergency_contact_name || null,
      emergency_contact_phone: result.emergency_contact_phone || null,
      notes: result.notes || null,
      status: result.status || 'active',
      created_at: result.created_at || new Date().toISOString(),
      updated_at: result.updated_at || new Date().toISOString(),
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
  data: Partial<Omit<Patient, 'id' | 'clinic_id'>>
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
      clinic_id: result.clinic_id,
      full_name: result.full_name || '',
      date_of_birth: result.date_of_birth || null,
      gender: result.gender || null,
      email: result.email || null,
      phone: result.phone || null,
      address: result.address || null,
      city: result.city || null,
      state: result.state || null,
      zip_code: result.zip_code || null,
      country: result.country || null,
      id_document: result.id_document || null,
      emergency_contact_name: result.emergency_contact_name || null,
      emergency_contact_phone: result.emergency_contact_phone || null,
      notes: result.notes || null,
      status: result.status || 'active',
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
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
      clinic_id: row.clinic_id,
      patient_id: row.patient_id,
      doctor_id: row.doctor_id || null,
      appointment_datetime: row.appointment_datetime || '',
      duration_minutes: row.duration_minutes || 30,
      status: row.status || 'scheduled',
      reason_for_visit: row.reason_for_visit || null,
      notes: row.notes || null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
      fecha: row.appointment_datetime ? row.appointment_datetime.split('T')[0] : '',
      hora: row.appointment_datetime ? row.appointment_datetime.substring(11, 16) : '',
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
      clinic_id: data.clinic_id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id || null,
      appointment_datetime: data.appointment_datetime || '',
      duration_minutes: data.duration_minutes || 30,
      status: data.status || 'scheduled',
      reason_for_visit: data.reason_for_visit || null,
      notes: data.notes || null,
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      fecha: data.appointment_datetime ? data.appointment_datetime.split('T')[0] : '',
      hora: data.appointment_datetime ? data.appointment_datetime.substring(11, 16) : '',
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
 * @param data - Appointment data (id and clinic_id will be added by service)
 * @returns Promise resolving to created Appointment
 * 
 * @requirement API-07 (Create new appointment)
 */
export async function createAppointment(
  clinicId: string,
  data: Omit<Appointment, 'id' | 'clinic_id'>
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
      clinic_id: result.clinic_id,
      patient_id: result.patient_id,
      doctor_id: result.doctor_id || null,
      appointment_datetime: result.appointment_datetime || '',
      duration_minutes: result.duration_minutes || 30,
      status: result.status || 'scheduled',
      reason_for_visit: result.reason_for_visit || null,
      notes: result.notes || null,
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
      fecha: result.appointment_datetime ? result.appointment_datetime.split('T')[0] : '',
      hora: result.appointment_datetime ? result.appointment_datetime.substring(11, 16) : '',
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
  data: Partial<Omit<Appointment, 'id' | 'clinic_id'>>
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
      clinic_id: result.clinic_id,
      patient_id: result.patient_id,
      doctor_id: result.doctor_id || null,
      appointment_datetime: result.appointment_datetime || '',
      duration_minutes: result.duration_minutes || 30,
      status: result.status || 'scheduled',
      reason_for_visit: result.reason_for_visit || null,
      notes: result.notes || null,
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
      fecha: result.appointment_datetime ? result.appointment_datetime.split('T')[0] : '',
      hora: result.appointment_datetime ? result.appointment_datetime.substring(11, 16) : '',
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
      clinic_id: row.clinic_id,
      patient_id: row.patient_id,
      recorded_at: row.recorded_at || '',
      temperature_celsius: row.temperature_celsius ?? null,
      systolic_pressure: row.systolic_pressure ?? null,
      diastolic_pressure: row.diastolic_pressure ?? null,
      heart_rate: row.heart_rate ?? null,
      respiratory_rate: row.respiratory_rate ?? null,
      oxygen_saturation_percent: row.oxygen_saturation_percent ?? null,
      weight_kg: row.weight_kg ?? null,
      height_cm: row.height_cm ?? null,
      blood_glucose_mg_dl: row.blood_glucose_mg_dl ?? null,
      notes: row.notes ?? null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
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
      clinic_id: result.clinic_id,
      patient_id: result.patient_id,
      recorded_at: result.recorded_at || '',
      temperature_celsius: result.temperature_celsius ?? null,
      systolic_pressure: result.systolic_pressure ?? null,
      diastolic_pressure: result.diastolic_pressure ?? null,
      heart_rate: result.heart_rate ?? null,
      respiratory_rate: result.respiratory_rate ?? null,
      oxygen_saturation_percent: result.oxygen_saturation_percent ?? null,
      weight_kg: result.weight_kg ?? null,
      height_cm: result.height_cm ?? null,
      blood_glucose_mg_dl: result.blood_glucose_mg_dl ?? null,
      notes: result.notes ?? null,
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
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
      clinic_id: result.clinic_id,
      patient_id: result.patient_id,
      recorded_at: result.recorded_at || '',
      temperature_celsius: result.temperature_celsius ?? null,
      systolic_pressure: result.systolic_pressure ?? null,
      diastolic_pressure: result.diastolic_pressure ?? null,
      heart_rate: result.heart_rate ?? null,
      respiratory_rate: result.respiratory_rate ?? null,
      oxygen_saturation_percent: result.oxygen_saturation_percent ?? null,
      weight_kg: result.weight_kg ?? null,
      height_cm: result.height_cm ?? null,
      blood_glucose_mg_dl: result.blood_glucose_mg_dl ?? null,
      notes: result.notes ?? null,
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
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
      clinic_id: row.clinic_id,
      appointment_id: row.appointment_id || null,
      patient_id: row.patient_id,
      doctor_id: row.doctor_id || null,
      chief_complaint: row.chief_complaint || null,
      findings: row.findings || null,
      diagnosis: row.diagnosis || null,
      treatment_plan: row.treatment_plan || null,
      prescriptions_given: row.prescriptions_given || null,
      follow_up_instructions: row.follow_up_instructions || null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
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
  data: Omit<ConsultationNote, 'id' | 'clinic_id'>
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
      clinic_id: result.clinic_id,
      appointment_id: result.appointment_id || null,
      patient_id: result.patient_id,
      doctor_id: result.doctor_id || null,
      chief_complaint: result.chief_complaint || null,
      findings: result.findings || null,
      diagnosis: result.diagnosis || null,
      treatment_plan: result.treatment_plan || null,
      prescriptions_given: result.prescriptions_given || null,
      follow_up_instructions: result.follow_up_instructions || null,
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
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
 * @returns Promise resolving to Attachment[]
 * 
 * @requirement API-05 (Fetch medical attachments)
 */
export async function getAttachments(
  clinicId: string,
  patientId?: string
): Promise<Attachment[]> {
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
      clinic_id: row.clinic_id,
      patient_id: row.patient_id,
      document_type: row.document_type || null,
      file_name: row.file_name || '',
      file_path: row.file_path || '',
      file_size_bytes: row.file_size_bytes ?? null,
      file_mime_type: row.file_mime_type || null,
      uploaded_by_doctor_id: row.uploaded_by_doctor_id || null,
      description: row.description || null,
      uploaded_at: row.uploaded_at || '',
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
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
 * @returns Promise resolving to created Attachment
 * 
 * @requirement API-07 (Create medical attachment)
 */
export async function createAttachment(
  clinicId: string,
  data: Omit<Attachment, 'id' | 'clinic_id'>
): Promise<Attachment> {
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
      clinic_id: result.clinic_id,
      patient_id: result.patient_id,
      document_type: result.document_type || null,
      file_name: result.file_name || '',
      file_path: result.file_path || '',
      file_size_bytes: result.file_size_bytes ?? null,
      file_mime_type: result.file_mime_type || null,
      uploaded_by_doctor_id: result.uploaded_by_doctor_id || null,
      description: result.description || null,
      uploaded_at: result.uploaded_at || '',
      created_at: result.created_at || '',
      updated_at: result.updated_at || '',
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
      user_id: row.user_id || '',
      clinic_id: row.clinic_id || '',
      specialization: row.specialization || null,
      license_number: row.license_number || null,
      biography: row.biography || null,
      availability_monday: row.availability_monday || null,
      availability_tuesday: row.availability_tuesday || null,
      availability_wednesday: row.availability_wednesday || null,
      availability_thursday: row.availability_thursday || null,
      availability_friday: row.availability_friday || null,
      availability_saturday: row.availability_saturday || null,
      availability_sunday: row.availability_sunday || null,
      office_phone: row.office_phone || null,
      office_email: row.office_email || null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
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
      clinic_id: row.clinic_id || '',
      patient_id: row.patient_id,
      condition_name: row.condition_name || '',
      diagnosis_date: row.diagnosis_date || null,
      status: row.status || 'active',
      severity: row.severity || null,
      notes: row.notes || null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
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
 * @returns Promise resolving to VaccineRecord[]
 * 
 * @requirement API-03 (Fetch vaccine records)
 */
export async function getVaccineRecords(
  clinicId: string,
  patientId: string
): Promise<VaccineRecord[]> {
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
      clinic_id: row.clinic_id || '',
      patient_id: row.patient_id,
      vaccine_name: row.vaccine_name || '',
      dose_number: row.dose_number ?? null,
      administration_date: row.administration_date || '',
      lot_number: row.lot_number || null,
      route_of_administration: row.route_of_administration || null,
      site_of_injection: row.site_of_injection || null,
      administered_by: row.administered_by || null,
      notes: row.notes || null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('code')) {
      throw err
    }
    const error = handleSupabaseError(err, `Fetching vaccine records for patient ${patientId}`)
    throw new Error(error.message)
  }
}
