import { createClient } from '@/lib/supabase';
import { AuthUser } from '@/lib/types';
import {
  Patient,
  Appointment,
  ConsultationNote,
  VitalSigns,
  DoctorProfile,
  Prescription,
  MedicalHistory,
  Vaccine,
  MedicalAttachment,
  Clinic,
} from '@/lib/types';

/**
 * Get current user's clinic context.
 * Verifies clinic_id from JWT claims (server-verified, not user-selectable).
 */
export async function getClinicContext(user: AuthUser | null): Promise<{
  clinic_id: string;
  user_role: 'admin' | 'doctor' | 'staff';
}> {
  if (!user) {
    throw new Error('User not authenticated');
  }

  return {
    clinic_id: user.clinic_id,
    user_role: user.user_role,
  };
}

/**
 * Get patients for current clinic.
 * RLS enforces clinic_id boundary; app layer adds explicit filter.
 * (Defense-in-depth: RLS + app-level filtering)
 */
export async function getPatients(
  clinic_id: string,
  options?: { limit?: number; offset?: number }
) {
  const supabase = await createClient();
  
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  
  return supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinic_id)
    .order('full_name', { ascending: true })
    .range(offset, offset + limit - 1);
}

/**
 * Get patient by ID with clinic isolation check.
 */
export async function getPatientById(clinic_id: string, patient_id: string) {
  const supabase = await createClient();
  
  return supabase
    .from('patients')
    .select('*')
    .eq('id', patient_id)
    .eq('clinic_id', clinic_id)
    .single();
}

/**
 * Create new patient in clinic.
 */
export async function createPatient(
  clinic_id: string,
  data: Omit<Patient, 'id' | 'clinicId'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('patients')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Update patient in clinic.
 */
export async function updatePatient(
  clinic_id: string,
  patient_id: string,
  data: Partial<Omit<Patient, 'id' | 'clinicId'>>
) {
  const supabase = await createClient();
  
  return supabase
    .from('patients')
    .update(data)
    .eq('id', patient_id)
    .eq('clinic_id', clinic_id)
    .select()
    .single();
}

/**
 * Get appointments for clinic with optional patient filter.
 */
export async function getAppointments(
  clinic_id: string,
  patient_id?: string,
  options?: { limit?: number; offset?: number }
) {
  const supabase = await createClient();
  
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', clinic_id);

  if (patient_id) {
    query = query.eq('patient_id', patient_id);
  }

  return query
    .order('appointment_datetime', { ascending: false })
    .range(offset, offset + limit - 1);
}

/**
 * Get appointment by ID with clinic isolation check.
 */
export async function getAppointmentById(clinic_id: string, appointment_id: string) {
  const supabase = await createClient();
  
  return supabase
    .from('appointments')
    .select('*')
    .eq('id', appointment_id)
    .eq('clinic_id', clinic_id)
    .single();
}

/**
 * Create appointment in clinic.
 */
export async function createAppointment(
  clinic_id: string,
  data: Omit<Appointment, 'id' | 'clinicId'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('appointments')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Update appointment in clinic.
 */
export async function updateAppointment(
  clinic_id: string,
  appointment_id: string,
  data: Partial<Omit<Appointment, 'id' | 'clinicId'>>
) {
  const supabase = await createClient();
  
  return supabase
    .from('appointments')
    .update(data)
    .eq('id', appointment_id)
    .eq('clinic_id', clinic_id)
    .select()
    .single();
}

/**
 * Get consultation notes for patient in clinic.
 */
export async function getConsultationNotes(
  clinic_id: string,
  patient_id: string
) {
  const supabase = await createClient();
  
  return supabase
    .from('consultation_notes')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('created_at', { ascending: false });
}

/**
 * Create consultation note in clinic.
 */
export async function createConsultationNote(
  clinic_id: string,
  data: Omit<ConsultationNote, 'id' | 'clinicId'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('consultation_notes')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Update consultation note in clinic.
 */
export async function updateConsultationNote(
  clinic_id: string,
  note_id: string,
  data: Partial<Omit<ConsultationNote, 'id' | 'clinicId'>>
) {
  const supabase = await createClient();
  
  return supabase
    .from('consultation_notes')
    .update(data)
    .eq('id', note_id)
    .eq('clinic_id', clinic_id)
    .select()
    .single();
}

/**
 * Get vital signs for patient in clinic.
 */
export async function getVitalSigns(
  clinic_id: string,
  patient_id: string,
  options?: { limit?: number }
) {
  const supabase = await createClient();
  
  return supabase
    .from('vital_signs')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('recorded_at', { ascending: false })
    .limit(options?.limit || 20);
}

/**
 * Create vital sign record in clinic.
 */
export async function createVitalSign(
  clinic_id: string,
  data: Omit<VitalSigns, 'id'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('vital_signs')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Get medical history for patient in clinic.
 */
export async function getMedicalHistory(
  clinic_id: string,
  patient_id: string
) {
  const supabase = await createClient();
  
  return supabase
    .from('medical_history')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('diagnosis_date', { ascending: false });
}

/**
 * Create medical history record in clinic.
 */
export async function createMedicalHistory(
  clinic_id: string,
  data: Omit<MedicalHistory, 'id'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('medical_history')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Get vaccine records for patient in clinic.
 */
export async function getVaccineRecords(
  clinic_id: string,
  patient_id: string
) {
  const supabase = await createClient();
  
  return supabase
    .from('vaccine_records')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('administration_date', { ascending: false });
}

/**
 * Create vaccine record in clinic.
 */
export async function createVaccineRecord(
  clinic_id: string,
  data: Omit<Vaccine, 'id'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('vaccine_records')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Get prescriptions for patient in clinic.
 */
export async function getPrescriptions(
  clinic_id: string,
  patient_id: string
) {
  const supabase = await createClient();
  
  return supabase
    .from('prescriptions')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('prescribed_at', { ascending: false });
}

/**
 * Create prescription in clinic.
 */
export async function createPrescription(
  clinic_id: string,
  data: Omit<Prescription, 'id'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('prescriptions')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Update prescription in clinic.
 */
export async function updatePrescription(
  clinic_id: string,
  prescription_id: string,
  data: Partial<Omit<Prescription, 'id'>>
) {
  const supabase = await createClient();
  
  return supabase
    .from('prescriptions')
    .update(data)
    .eq('id', prescription_id)
    .eq('clinic_id', clinic_id)
    .select()
    .single();
}

/**
 * Get attachments for patient in clinic.
 */
export async function getAttachments(
  clinic_id: string,
  patient_id: string
) {
  const supabase = await createClient();
  
  return supabase
    .from('attachments')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('patient_id', patient_id)
    .order('uploaded_at', { ascending: false });
}

/**
 * Create attachment in clinic.
 */
export async function createAttachment(
  clinic_id: string,
  data: Omit<MedicalAttachment, 'id' | 'clinicId'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('attachments')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Get doctors for clinic.
 */
export async function getDoctors(clinic_id: string) {
  const supabase = await createClient();
  
  return supabase
    .from('doctor_profiles')
    .select('*')
    .eq('clinic_id', clinic_id)
    .order('created_at', { ascending: false });
}

/**
 * Get doctor by ID in clinic.
 */
export async function getDoctorById(clinic_id: string, doctor_id: string) {
  const supabase = await createClient();
  
  return supabase
    .from('doctor_profiles')
    .select('*')
    .eq('id', doctor_id)
    .eq('clinic_id', clinic_id)
    .single();
}

/**
 * Create doctor profile in clinic.
 */
export async function createDoctor(
  clinic_id: string,
  data: Omit<DoctorProfile, 'id'>
) {
  const supabase = await createClient();
  
  return supabase
    .from('doctor_profiles')
    .insert({
      clinic_id,
      ...data,
    })
    .select()
    .single();
}

/**
 * Update doctor profile in clinic.
 */
export async function updateDoctor(
  clinic_id: string,
  doctor_id: string,
  data: Partial<Omit<DoctorProfile, 'id'>>
) {
  const supabase = await createClient();
  
  return supabase
    .from('doctor_profiles')
    .update(data)
    .eq('id', doctor_id)
    .eq('clinic_id', clinic_id)
    .select()
    .single();
}

/**
 * Get clinic by ID.
 */
export async function getClinic(clinic_id: string) {
  const supabase = await createClient();
  
  return supabase
    .from('clinics')
    .select('*')
    .eq('id', clinic_id)
    .single();
}

/**
 * Export all query functions for use in components
 */
export const dbQueries = {
  getClinicContext,
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  getConsultationNotes,
  createConsultationNote,
  updateConsultationNote,
  getVitalSigns,
  createVitalSign,
  getMedicalHistory,
  createMedicalHistory,
  getVaccineRecords,
  createVaccineRecord,
  getPrescriptions,
  createPrescription,
  updatePrescription,
  getAttachments,
  createAttachment,
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getClinic,
};
