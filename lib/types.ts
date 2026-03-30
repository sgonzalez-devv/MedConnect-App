// Authentication types (Phase 1)
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

export interface Patient {
  id: string
  clinicId: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  genero: "masculino" | "femenino" | "otro"
  direccion: string
  alergias: string[]
  condicionesCronicas: string[]
  grupoSanguineo: string
  avatar?: string
  fechaRegistro: string
}

export interface Appointment {
  id: string
  clinicId: string
  pacienteId: string
  paciente?: Patient
  fecha: string
  hora: string
  duracion: number // minutos
  tipo: "consulta" | "seguimiento" | "urgencia" | "revision"
  estado: "programada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_asistio"
  motivo: string
  notas?: string
  creadoPorBot: boolean
}

export interface ConsultationNote {
  id: string
  clinicId: string
  pacienteId: string
  citaId: string
  fecha: string
  diagnostico: string
  sintomas: string[]
  tratamiento: string
  recetas: Prescription[]
  observaciones: string
  doctorId: string
}

export interface Prescription {
  id: string
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  instrucciones?: string
}

export interface MedicalAttachment {
  id: string
  clinicId: string
  pacienteId: string
  tipo: "laboratorio" | "imagen" | "documento"
  nombre: string
  fecha: string
  url: string
  descripcion?: string
}

export interface WhatsAppConversation {
  id: string
  clinicId: string
  pacienteId: string
  paciente?: Patient
  mensajes: WhatsAppMessage[]
  ultimaActualizacion: string
  estado: "activa" | "pendiente" | "resuelta"
}

export interface WhatsAppMessage {
  id: string
  contenido: string
  tipo: "entrante" | "saliente" | "bot"
  timestamp: string
  leido: boolean
}

export interface Notification {
  id: string
  clinicId: string
  tipo: "cita" | "mensaje" | "recordatorio" | "sistema"
  titulo: string
  mensaje: string
  timestamp: string
  leida: boolean
  accion?: {
    tipo: "ver_cita" | "ver_paciente" | "ver_mensaje"
    id: string
  }
}

export interface DoctorProfile {
  id: string
  nombre: string
  especialidad: string
  email: string
  telefono: string
  horarioInicio: string
  horarioFin: string
  diasLaborales: number[]
  duracionCitaDefault: number
  avatar?: string
}

// Medical Record Types
export interface VitalSigns {
  id: string
  pacienteId: string
  citaId?: string
  fecha: string
  presionSistolica: number
  presionDiastolica: number
  frecuenciaCardiaca: number
  temperatura: number
  peso: number
  talla: number
  saturacionOxigeno?: number
  glucosa?: number
  notas?: string
}

export interface MedicalHistory {
  id: string
  pacienteId: string
  tipo: "personal" | "familiar"
  categoria: "enfermedad" | "cirugia" | "hospitalizacion" | "otro"
  descripcion: string
  fecha?: string
  parentesco?: string // Para antecedentes familiares
  notas?: string
}

export interface Vaccine {
  id: string
  pacienteId: string
  nombre: string
  fecha: string
  dosis?: string
  lote?: string
  proximaDosis?: string
  aplicadoPor?: string
  notas?: string
}

export interface MedicalRecord {
  pacienteId: string
  signosVitales: VitalSigns[]
  antecedentes: MedicalHistory[]
  vacunas: Vaccine[]
  notasConsulta: ConsultationNote[]
  archivosAdjuntos: MedicalAttachment[]
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
// API Response & Request Types (Phase 4)
// ============================================================================

/**
 * Standard API response wrapper for all service layer operations
 * 
 * @requirement API-01
 * @example
 * const response: ApiResponse<Patient[]> = {
 *   data: [...],
 *   status: 200,
 *   timestamp: "2026-03-30T14:30:00Z"
 * }
 */
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
  timestamp?: string
}

/**
 * Standard API error response structure
 * 
 * Used by error handlers to provide consistent error information
 * to frontend components without exposing database details.
 * 
 * @requirement ERR-01, ERR-02, ERR-03, ERR-04, ERR-05
 */
export interface ApiError {
  code: string // Error category: AUTH_ERROR, CLINIC_ISOLATION_ERROR, VALIDATION_ERROR, CONNECTION_ERROR
  message: string // User-friendly message (never raw DB errors)
  details?: unknown // Technical details for logging (not sent to user)
  timestamp: string
}

/**
 * Request type for creating a new patient via forms
 * 
 * @requirement API-07
 */
export interface CreatePatientRequest {
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento: string
  genero: 'masculino' | 'femenino' | 'otro'
  direccion: string
  alergias?: string[]
  condicionesCronicas?: string[]
  grupoSanguineo?: string
  avatar?: string
}

/**
 * Request type for updating an appointment via forms
 * 
 * @requirement API-08
 */
export interface UpdateAppointmentRequest {
  fecha?: string
  hora?: string
  duracion?: number
  tipo?: 'consulta' | 'seguimiento' | 'urgencia' | 'revision'
  estado?: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio'
  motivo?: string
  notas?: string
}

/**
 * Request type for creating an appointment via forms
 * 
 * @requirement API-07
 */
export interface CreateAppointmentRequest {
  pacienteId: string
  fecha: string
  hora: string
  duracion: number
  tipo: 'consulta' | 'seguimiento' | 'urgencia' | 'revision'
  motivo: string
  notas?: string
}

/**
 * Pagination metadata for list responses
 * 
 * Used when returning paginated data from list endpoints
 * 
 * @requirement API-01
 */
export interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
