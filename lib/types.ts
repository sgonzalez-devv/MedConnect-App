// Authentication types
export interface AuthUser {
  id: string // UUID from Supabase Auth
  email: string
  clinic_id: string // From JWT custom claims
  user_role: 'admin' | 'doctor' | 'staff'
  full_name?: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token?: string
  expires_at: number // Unix timestamp
}

// Database-aligned interfaces

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  id_document: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  doctor_id: string | null
  appointment_datetime: string
  duration_minutes: number
  status: string
  reason_for_visit: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Computed/derived properties for frontend convenience
  patient?: Patient
  fecha?: string // derived: YYYY-MM-DD from appointment_datetime
  hora?: string // derived: HH:MM from appointment_datetime
}

export interface DoctorProfile {
  id: string
  user_id: string
  clinic_id: string
  specialization: string | null
  license_number: string | null
  biography: string | null
  availability_monday: string | null
  availability_tuesday: string | null
  availability_wednesday: string | null
  availability_thursday: string | null
  availability_friday: string | null
  availability_saturday: string | null
  availability_sunday: string | null
  office_phone: string | null
  office_email: string | null
  created_at: string
  updated_at: string
}

export interface ConsultationNote {
  id: string
  clinic_id: string
  appointment_id: string | null
  patient_id: string
  doctor_id: string | null
  chief_complaint: string | null
  findings: string | null
  diagnosis: string | null
  treatment_plan: string | null
  prescriptions_given: string | null
  follow_up_instructions: string | null
  created_at: string
  updated_at: string
}

export interface VitalSigns {
  id: string
  clinic_id: string
  patient_id: string
  recorded_at: string
  temperature_celsius: number | null
  systolic_pressure: number | null
  diastolic_pressure: number | null
  heart_rate: number | null
  respiratory_rate: number | null
  oxygen_saturation_percent: number | null
  weight_kg: number | null
  height_cm: number | null
  blood_glucose_mg_dl: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MedicalHistory {
  id: string
  clinic_id: string
  patient_id: string
  condition_name: string
  diagnosis_date: string | null
  status: string
  severity: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VaccineRecord {
  id: string
  clinic_id: string
  patient_id: string
  vaccine_name: string
  dose_number: number | null
  administration_date: string
  lot_number: string | null
  route_of_administration: string | null
  site_of_injection: string | null
  administered_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: string
  clinic_id: string
  patient_id: string
  document_type: string | null
  file_name: string
  file_path: string
  file_size_bytes: number | null
  file_mime_type: string | null
  uploaded_by_doctor_id: string | null
  description: string | null
  uploaded_at: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  clinic_id: string
  patient_id: string
  doctor_id: string | null
  medication_name: string
  dosage_amount: number | null
  dosage_unit: string | null
  frequency: string | null
  duration_days: number | null
  instructions: string | null
  status: string
  prescribed_at: string
  created_at: string
  updated_at: string
}

// Mock interfaces (no DB tables yet)

export interface WhatsAppConversation {
  id: string
  clinicId: string
  pacienteId: string
  paciente?: Patient
  mensajes: WhatsAppMessage[]
  ultimaActualizacion: string
  estado: 'activa' | 'pendiente' | 'resuelta'
}

export interface WhatsAppMessage {
  id: string
  contenido: string
  tipo: 'entrante' | 'saliente' | 'bot'
  timestamp: string
  leido: boolean
}

export interface Notification {
  id: string
  clinicId: string
  tipo: 'cita' | 'mensaje' | 'recordatorio' | 'sistema'
  titulo: string
  mensaje: string
  timestamp: string
  leida: boolean
  accion?: {
    tipo: 'ver_cita' | 'ver_paciente' | 'ver_mensaje'
    id: string
  }
}

// Clinic and Multi-Clinic Types

export interface ClinicColorPalette {
  id: string
  presetName: 'teal' | 'blue' | 'indigo' | 'green' | 'purple'
  customSecondaryHex?: string
}

export interface Clinic {
  id: string
  name: string
  location: string
  email: string
  telefono: string
  colorPalette: ClinicColorPalette
}

export interface ClinicGroup {
  id: string
  name: string
  clinicIds: string[]
  createdAt: string
  ownerId: string
}

export interface GroupMetrics {
  totalPatients: number
  totalAppointments: number
  appointmentsThisMonth: number
  completedAppointmentsThisMonth: number
  appointmentsByClinic: Record<string, number>
}

// ============================================================================
// API Response & Request Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
  timestamp?: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
  timestamp: string
}

export interface CreatePatientRequest {
  full_name: string
  date_of_birth: string
  gender: string
  email: string
  phone: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  id_document?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
  status?: string
}

export interface CreateAppointmentRequest {
  patient_id: string
  doctor_id?: string
  appointment_datetime: string
  duration_minutes: number
  reason_for_visit?: string
  notes?: string
  status?: string
}

export interface UpdateAppointmentRequest {
  doctor_id?: string
  appointment_datetime?: string
  duration_minutes?: number
  status?: string
  reason_for_visit?: string
  notes?: string
}

export interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
