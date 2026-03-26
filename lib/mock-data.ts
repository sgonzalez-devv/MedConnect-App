import type {
  Patient,
  Appointment,
  ConsultationNote,
  MedicalAttachment,
  WhatsAppConversation,
  Notification,
  DoctorProfile,
  VitalSigns,
  MedicalHistory,
  Vaccine,
  Clinic,
  ClinicGroup,
  GroupMetrics,
} from "./types"

export const doctorProfile: DoctorProfile = {
  id: "doc-001",
  nombre: "Dra. Carmen Altagracia Pérez",
  especialidad: "Medicina General",
  email: "carmen.perez@medconnect.com",
  telefono: "+1 809 555 1234",
  horarioInicio: "08:00",
  horarioFin: "17:00",
  diasLaborales: [1, 2, 3, 4, 5],
  duracionCitaDefault: 30,
  avatar: undefined,
}

// Clinic Management Data
export const clinics: Clinic[] = [
  {
    id: 'clinic-001',
    name: 'Clínica Central',
    location: 'Santo Domingo',
    email: 'central@clinic.com',
    telefono: '+1 809 555 0001',
    colorPalette: {
      id: 'palette-001',
      presetName: 'teal',
    },
  },
  {
    id: 'clinic-002',
    name: 'Clínica Naco',
    location: 'Santo Domingo',
    email: 'naco@clinic.com',
    telefono: '+1 809 555 0002',
    colorPalette: {
      id: 'palette-002',
      presetName: 'blue',
    },
  },
]

export const clinicGroups: ClinicGroup[] = [
  {
    id: 'group-001',
    name: 'Grupo Central & Naco',
    clinicIds: ['clinic-001', 'clinic-002'],
    createdAt: '2024-01-01',
    ownerId: 'owner-001',
  },
]

export const patients: Patient[] = [
  {
    id: "pac-001",
    clinicId: "clinic-001",
    nombre: "Juan Carlos",
    apellido: "Rodríguez Marte",
    email: "juancarlos.rodriguez@gmail.com",
    telefono: "+1 809 555 9876",
    fechaNacimiento: "1985-03-15",
    genero: "masculino",
    direccion: "Av. Abraham Lincoln #502, Piantini, Santo Domingo",
    alergias: ["Penicilina"],
    condicionesCronicas: ["Hipertensión"],
    grupoSanguineo: "O+",
    fechaRegistro: "2024-01-10",
  },
  {
    id: "pac-002",
    clinicId: "clinic-001",
    nombre: "Yolanda",
    apellido: "De los Santos Mejía",
    email: "yolanda.delossantos@hotmail.com",
    telefono: "+1 829 555 1122",
    fechaNacimiento: "1992-07-22",
    genero: "femenino",
    direccion: "Calle El Conde #234, Zona Colonial, Santo Domingo",
    alergias: [],
    condicionesCronicas: [],
    grupoSanguineo: "A+",
    fechaRegistro: "2024-02-05",
  },
  {
    id: "pac-003",
    clinicId: "clinic-002",
    nombre: "Rafael Antonio",
    apellido: "Peña Bautista",
    email: "rafael.pena@gmail.com",
    telefono: "+1 809 555 5566",
    fechaNacimiento: "1978-11-08",
    genero: "masculino",
    direccion: "Av. 27 de Febrero #890, Naco, Santo Domingo",
    alergias: ["Sulfonamidas", "Ibuprofeno"],
    condicionesCronicas: ["Diabetes Tipo 2", "Artritis"],
    grupoSanguineo: "B+",
    fechaRegistro: "2023-08-20",
  },
  {
    id: "pac-004",
    clinicId: "clinic-002",
    nombre: "Mercedes Altagracia",
    apellido: "Familia Núñez",
    email: "mercedes.familia@gmail.com",
    telefono: "+1 849 555 3344",
    fechaNacimiento: "1965-04-30",
    genero: "femenino",
    direccion: "Calle Las Palmas #45, Los Jardines, Santiago",
    alergias: ["Aspirina"],
    condicionesCronicas: ["Hipertiroidismo"],
    grupoSanguineo: "AB+",
    fechaRegistro: "2023-05-12",
  },
  {
    id: "pac-005",
    clinicId: "clinic-002",
    nombre: "José Miguel",
    apellido: "Taveras Polanco",
    email: "josemiguel.taveras@gmail.com",
    telefono: "+1 809 555 7788",
    fechaNacimiento: "1990-09-18",
    genero: "masculino",
    direccion: "Av. Independencia #1200, Gazcue, Santo Domingo",
    alergias: [],
    condicionesCronicas: [],
    grupoSanguineo: "O-",
    fechaRegistro: "2024-03-01",
  },
]

const today = new Date()
const formatDate = (date: Date) => date.toISOString().split("T")[0]

export const appointments: Appointment[] = [
  // Citas de hoy - variedad de tipos
  {
    id: "cita-001",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    fecha: formatDate(today),
    hora: "09:00",
    duracion: 30,
    tipo: "consulta",
    estado: "confirmada",
    motivo: "Control de presión arterial",
    creadoPorBot: false,
  },
  {
    id: "cita-002",
    clinicId: "clinic-001",
    pacienteId: "pac-002",
    fecha: formatDate(today),
    hora: "09:30",
    duracion: 30,
    tipo: "urgencia",
    estado: "programada",
    motivo: "Dolor de cabeza severo y mareos",
    creadoPorBot: true,
  },
  {
    id: "cita-003",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    fecha: formatDate(today),
    hora: "10:30",
    duracion: 45,
    tipo: "seguimiento",
    estado: "confirmada",
    motivo: "Revisión de glucosa y ajuste de tratamiento",
    creadoPorBot: false,
  },
  {
    id: "cita-004",
    clinicId: "clinic-002",
    pacienteId: "pac-004",
    fecha: formatDate(today),
    hora: "11:30",
    duracion: 30,
    tipo: "revision",
    estado: "programada",
    motivo: "Chequeo general anual",
    creadoPorBot: true,
  },
  {
    id: "cita-008",
    clinicId: "clinic-002",
    pacienteId: "pac-005",
    fecha: formatDate(today),
    hora: "14:00",
    duracion: 30,
    tipo: "consulta",
    estado: "programada",
    motivo: "Dolor en articulaciones",
    creadoPorBot: false,
  },
  {
    id: "cita-009",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    fecha: formatDate(today),
    hora: "15:00",
    duracion: 20,
    tipo: "urgencia",
    estado: "confirmada",
    motivo: "Reacción alérgica leve",
    creadoPorBot: true,
  },
  {
    id: "cita-010",
    clinicId: "clinic-001",
    pacienteId: "pac-002",
    fecha: formatDate(today),
    hora: "16:00",
    duracion: 45,
    tipo: "revision",
    estado: "programada",
    motivo: "Resultados de laboratorio",
    creadoPorBot: false,
  },
  // Citas de mañana
  {
    id: "cita-005",
    clinicId: "clinic-002",
    pacienteId: "pac-005",
    fecha: formatDate(new Date(today.getTime() + 86400000)),
    hora: "09:00",
    duracion: 30,
    tipo: "consulta",
    estado: "programada",
    motivo: "Primera consulta",
    creadoPorBot: false,
  },
  {
    id: "cita-011",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    fecha: formatDate(new Date(today.getTime() + 86400000)),
    hora: "10:00",
    duracion: 45,
    tipo: "seguimiento",
    estado: "programada",
    motivo: "Control de diabetes mensual",
    creadoPorBot: false,
  },
  {
    id: "cita-012",
    clinicId: "clinic-002",
    pacienteId: "pac-004",
    fecha: formatDate(new Date(today.getTime() + 86400000)),
    hora: "11:30",
    duracion: 30,
    tipo: "revision",
    estado: "confirmada",
    motivo: "Revisión de tiroides",
    creadoPorBot: true,
  },
  {
    id: "cita-013",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    fecha: formatDate(new Date(today.getTime() + 86400000)),
    hora: "14:00",
    duracion: 30,
    tipo: "urgencia",
    estado: "programada",
    motivo: "Síntomas respiratorios agudos",
    creadoPorBot: true,
  },
  // Pasado mañana
  {
    id: "cita-014",
    clinicId: "clinic-001",
    pacienteId: "pac-002",
    fecha: formatDate(new Date(today.getTime() + 2 * 86400000)),
    hora: "09:30",
    duracion: 30,
    tipo: "consulta",
    estado: "programada",
    motivo: "Evaluación de migraña",
    creadoPorBot: false,
  },
  {
    id: "cita-015",
    clinicId: "clinic-002",
    pacienteId: "pac-005",
    fecha: formatDate(new Date(today.getTime() + 2 * 86400000)),
    hora: "11:00",
    duracion: 45,
    tipo: "seguimiento",
    estado: "programada",
    motivo: "Seguimiento post-consulta",
    creadoPorBot: false,
  },
  // Citas pasadas - completadas
  {
    id: "cita-006",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    fecha: formatDate(new Date(today.getTime() - 7 * 86400000)),
    hora: "10:00",
    duracion: 30,
    tipo: "consulta",
    estado: "completada",
    motivo: "Control mensual",
    notas: "Presión estable, continuar medicación",
    creadoPorBot: false,
  },
  {
    id: "cita-007",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    fecha: formatDate(new Date(today.getTime() - 14 * 86400000)),
    hora: "11:00",
    duracion: 45,
    tipo: "seguimiento",
    estado: "completada",
    motivo: "Ajuste de medicación diabetes",
    notas: "Se ajustó dosis de metformina",
    creadoPorBot: false,
  },
  {
    id: "cita-016",
    clinicId: "clinic-002",
    pacienteId: "pac-004",
    fecha: formatDate(new Date(today.getTime() - 3 * 86400000)),
    hora: "09:00",
    duracion: 30,
    tipo: "urgencia",
    estado: "completada",
    motivo: "Dolor abdominal agudo",
    notas: "Gastritis aguda, se recetó omeprazol",
    creadoPorBot: true,
  },
  {
    id: "cita-017",
    clinicId: "clinic-001",
    pacienteId: "pac-002",
    fecha: formatDate(new Date(today.getTime() - 5 * 86400000)),
    hora: "15:00",
    duracion: 30,
    tipo: "revision",
    estado: "completada",
    motivo: "Revisión de exámenes de sangre",
    notas: "Valores dentro de parámetros normales",
    creadoPorBot: false,
  },
  // Citas canceladas/no asistió
  {
    id: "cita-018",
    clinicId: "clinic-002",
    pacienteId: "pac-005",
    fecha: formatDate(new Date(today.getTime() - 2 * 86400000)),
    hora: "10:00",
    duracion: 30,
    tipo: "consulta",
    estado: "cancelada",
    motivo: "Dolor de espalda",
    notas: "Cancelada por el paciente",
    creadoPorBot: false,
  },
  {
    id: "cita-019",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    fecha: formatDate(new Date(today.getTime() - 10 * 86400000)),
    hora: "14:00",
    duracion: 30,
    tipo: "seguimiento",
    estado: "no_asistio",
    motivo: "Control de presión",
    creadoPorBot: false,
  },
  // Más citas futuras
  {
    id: "cita-020",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    fecha: formatDate(new Date(today.getTime() + 3 * 86400000)),
    hora: "09:00",
    duracion: 45,
    tipo: "revision",
    estado: "programada",
    motivo: "Revisión trimestral de diabetes",
    creadoPorBot: false,
  },
  {
    id: "cita-021",
    clinicId: "clinic-002",
    pacienteId: "pac-004",
    fecha: formatDate(new Date(today.getTime() + 4 * 86400000)),
    hora: "10:30",
    duracion: 30,
    tipo: "consulta",
    estado: "programada",
    motivo: "Evaluación de síntomas tiroideos",
    creadoPorBot: true,
  },
  {
    id: "cita-022",
    clinicId: "clinic-001",
    pacienteId: "pac-002",
    fecha: formatDate(new Date(today.getTime() + 5 * 86400000)),
    hora: "11:00",
    duracion: 30,
    tipo: "urgencia",
    estado: "confirmada",
    motivo: "Revisión urgente de síntomas",
    creadoPorBot: true,
  },
  {
    id: "cita-023",
    clinicId: "clinic-002",
    pacienteId: "pac-005",
    fecha: formatDate(new Date(today.getTime() + 7 * 86400000)),
    hora: "09:30",
    duracion: 45,
    tipo: "seguimiento",
    estado: "programada",
    motivo: "Seguimiento de tratamiento",
    creadoPorBot: false,
  },
]

export const consultationNotes: ConsultationNote[] = [
  {
    id: "nota-001",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    citaId: "cita-006",
    fecha: formatDate(new Date(today.getTime() - 7 * 86400000)),
    diagnostico: "Hipertensión arterial controlada",
    sintomas: ["Ninguno reportado"],
    tratamiento: "Continuar con tratamiento actual",
    recetas: [
      {
        id: "rec-001",
        medicamento: "Losartán",
        dosis: "50mg",
        frecuencia: "Una vez al día",
        duracion: "30 días",
        instrucciones: "Tomar por la mañana",
      },
    ],
    observaciones: "Paciente refiere sentirse bien. Presión arterial 120/80.",
    doctorId: "doc-001",
  },
  {
    id: "nota-002",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    citaId: "cita-007",
    fecha: formatDate(new Date(today.getTime() - 14 * 86400000)),
    diagnostico: "Diabetes Mellitus Tipo 2 - Ajuste de tratamiento",
    sintomas: ["Fatiga leve", "Sed aumentada"],
    tratamiento: "Ajuste de dosis de metformina",
    recetas: [
      {
        id: "rec-002",
        medicamento: "Metformina",
        dosis: "850mg",
        frecuencia: "Dos veces al día",
        duracion: "30 días",
        instrucciones: "Tomar con alimentos",
      },
      {
        id: "rec-003",
        medicamento: "Glibenclamida",
        dosis: "5mg",
        frecuencia: "Una vez al día",
        duracion: "30 días",
        instrucciones: "Tomar antes del desayuno",
      },
    ],
    observaciones: "Glucosa en ayunas: 145 mg/dL. Se recomienda dieta baja en carbohidratos.",
    doctorId: "doc-001",
  },
]

export const medicalAttachments: MedicalAttachment[] = [
  {
    id: "att-001",
    clinicId: "clinic-001",
    pacienteId: "pac-001",
    tipo: "laboratorio",
    nombre: "Química Sanguínea Completa",
    fecha: formatDate(new Date(today.getTime() - 7 * 86400000)),
    url: "#",
    descripcion: "Resultados de laboratorio mensuales",
  },
  {
    id: "att-002",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    tipo: "laboratorio",
    nombre: "Hemoglobina Glicosilada",
    fecha: formatDate(new Date(today.getTime() - 14 * 86400000)),
    url: "#",
    descripcion: "HbA1c: 7.2%",
  },
  {
    id: "att-003",
    clinicId: "clinic-002",
    pacienteId: "pac-003",
    tipo: "imagen",
    nombre: "Radiografía de Rodilla",
    fecha: formatDate(new Date(today.getTime() - 30 * 86400000)),
    url: "#",
    descripcion: "Evaluación de artritis",
  },
  {
    id: "att-004",
    clinicId: "clinic-002",
    pacienteId: "pac-004",
    tipo: "laboratorio",
    nombre: "Perfil Tiroideo",
    fecha: formatDate(new Date(today.getTime() - 60 * 86400000)),
    url: "#",
    descripcion: "TSH, T3, T4",
  },
]

export const whatsappConversations: WhatsAppConversation[] = [
  {
    id: "conv-001",
    clinicId: "clinic-001",
    pacienteId: "pac-002",
    ultimaActualizacion: new Date(today.getTime() - 3600000).toISOString(),
    estado: "activa",
    mensajes: [
      {
        id: "msg-001",
        contenido: "Hola, quisiera agendar una cita para mañana",
        tipo: "entrante",
        timestamp: new Date(today.getTime() - 7200000).toISOString(),
        leido: true,
      },
      {
        id: "msg-002",
        contenido: "¡Hola Yolanda! Claro, tenemos disponibilidad mañana a las 9:00, 10:30 y 14:00. ¿Cuál horario te conviene?",
        tipo: "bot",
        timestamp: new Date(today.getTime() - 7100000).toISOString(),
        leido: true,
      },
      {
        id: "msg-003",
        contenido: "El de las 10:30 por favor",
        tipo: "entrante",
        timestamp: new Date(today.getTime() - 6000000).toISOString(),
        leido: true,
      },
      {
        id: "msg-004",
        contenido: "Perfecto, he agendado tu cita para mañana a las 10:30. ¿Podrías indicarme el motivo de la consulta?",
        tipo: "bot",
        timestamp: new Date(today.getTime() - 5900000).toISOString(),
        leido: true,
      },
      {
        id: "msg-005",
        contenido: "He tenido dolor de cabeza muy fuerte estos últimos días",
        tipo: "entrante",
        timestamp: new Date(today.getTime() - 3600000).toISOString(),
        leido: false,
      },
    ],
  },
  {
    id: "conv-002",
    clinicId: "clinic-002",
    pacienteId: "pac-005",
    ultimaActualizacion: new Date(today.getTime() - 86400000).toISOString(),
    estado: "resuelta",
    mensajes: [
      {
        id: "msg-006",
        contenido: "Buenos días, necesito reagendar mi cita",
        tipo: "entrante",
        timestamp: new Date(today.getTime() - 90000000).toISOString(),
        leido: true,
      },
      {
        id: "msg-007",
        contenido: "Claro José Miguel, ¿qué día te viene bien?",
        tipo: "bot",
        timestamp: new Date(today.getTime() - 89900000).toISOString(),
        leido: true,
      },
      {
        id: "msg-008",
        contenido: "El próximo martes a las 10",
        tipo: "entrante",
        timestamp: new Date(today.getTime() - 86400000).toISOString(),
        leido: true,
      },
      {
        id: "msg-009",
        contenido: "Perfecto, tu cita está programada para el martes a las 10:00. ¡Hasta pronto!",
        tipo: "bot",
        timestamp: new Date(today.getTime() - 86300000).toISOString(),
        leido: true,
      },
    ],
  },
]

export const notifications: Notification[] = [
  {
    id: "notif-001",
    clinicId: "clinic-001",
    tipo: "cita",
    titulo: "Recordatorio de cita",
    mensaje: "Tu cita de hoy a las 09:00 con la Dra. Carmen Pérez",
    timestamp: new Date(today.getTime() - 7200000).toISOString(),
    leida: true,
    accion: {
      tipo: "ver_cita",
      id: "cita-001",
    },
  },
  {
    id: "notif-002",
    clinicId: "clinic-001",
    tipo: "mensaje",
    titulo: "Nuevo mensaje",
    mensaje: "Yolanda envió un mensaje: 'He tenido dolor de cabeza...'",
    timestamp: new Date(today.getTime() - 3600000).toISOString(),
    leida: false,
    accion: {
      tipo: "ver_mensaje",
      id: "conv-001",
    },
  },
  {
    id: "notif-003",
    clinicId: "clinic-002",
    tipo: "recordatorio",
    titulo: "Cita próxima",
    mensaje: "Tienes una cita programada para mañana a las 10:00",
    timestamp: new Date(today.getTime() - 1800000).toISOString(),
    leida: false,
    accion: {
      tipo: "ver_cita",
      id: "cita-011",
    },
  },
  {
    id: "notif-004",
    clinicId: "clinic-001",
    tipo: "sistema",
    titulo: "Actualización del sistema",
    mensaje: "Tu información médica fue actualizada",
    timestamp: new Date(today.getTime() - 600000).toISOString(),
    leida: true,
  },
  {
    id: "notif-005",
    clinicId: "clinic-001",
    tipo: "cita",
    titulo: "Cita confirmada",
    mensaje: "Tu cita del 27 a las 09:00 ha sido confirmada",
    timestamp: new Date(today.getTime() - 300000).toISOString(),
    leida: false,
    accion: {
      tipo: "ver_cita",
      id: "cita-014",
    },
  },
  {
    id: "notif-006",
    clinicId: "clinic-001",
    tipo: "recordatorio",
    titulo: "Renovación de medicamentos",
    mensaje: "Es hora de renovar tu receta de Losartán",
    timestamp: new Date(today.getTime() - 100000).toISOString(),
    leida: true,
  },
]

// Vital Signs
export const vitalSigns: VitalSigns[] = [
  {
    id: "vs-001",
    pacienteId: "pac-001",
    citaId: "cita-001",
    fecha: formatDate(today),
    presionSistolica: 120,
    presionDiastolica: 80,
    frecuenciaCardiaca: 72,
    temperatura: 36.8,
    peso: 75,
    talla: 180,
    saturacionOxigeno: 98,
    glucosa: 95,
  },
  {
    id: "vs-002",
    pacienteId: "pac-003",
    citaId: "cita-003",
    fecha: formatDate(today),
    presionSistolica: 130,
    presionDiastolica: 85,
    frecuenciaCardiaca: 78,
    temperatura: 36.6,
    peso: 82,
    talla: 175,
    saturacionOxigeno: 97,
    glucosa: 145,
  },
  {
    id: "vs-003",
    pacienteId: "pac-002",
    fecha: formatDate(new Date(today.getTime() - 7 * 86400000)),
    presionSistolica: 118,
    presionDiastolica: 78,
    frecuenciaCardiaca: 70,
    temperatura: 36.9,
    peso: 65,
    talla: 165,
    saturacionOxigeno: 99,
    glucosa: 92,
  },
  {
    id: "vs-004",
    pacienteId: "pac-004",
    fecha: formatDate(new Date(today.getTime() - 3 * 86400000)),
    presionSistolica: 115,
    presionDiastolica: 76,
    frecuenciaCardiaca: 68,
    temperatura: 37.0,
    peso: 70,
    talla: 172,
    saturacionOxigeno: 98,
    glucosa: 98,
  },
  {
    id: "vs-005",
    pacienteId: "pac-005",
    fecha: formatDate(new Date(today.getTime() - 5 * 86400000)),
    presionSistolica: 125,
    presionDiastolica: 82,
    frecuenciaCardiaca: 75,
    temperatura: 36.7,
    peso: 80,
    talla: 182,
    saturacionOxigeno: 99,
    glucosa: 96,
  },
]

// Medical History
export const medicalHistory: MedicalHistory[] = [
  {
    id: "hist-001",
    pacienteId: "pac-001",
    tipo: "personal",
    categoria: "enfermedad",
    descripcion: "Hipertensión arterial desde hace 10 años",
    fecha: "2014-01-01",
    notas: "Controlada con medicación",
  },
  {
    id: "hist-002",
    pacienteId: "pac-001",
    tipo: "personal",
    categoria: "cirugia",
    descripcion: "Apendicectomía",
    fecha: "2005-06-15",
    notas: "Sin complicaciones",
  },
  {
    id: "hist-003",
    pacienteId: "pac-003",
    tipo: "personal",
    categoria: "enfermedad",
    descripcion: "Diabetes Tipo 2",
    fecha: "2015-03-10",
    notas: "Requiere seguimiento regular",
  },
  {
    id: "hist-004",
    pacienteId: "pac-003",
    tipo: "personal",
    categoria: "enfermedad",
    descripcion: "Artritis",
    fecha: "2018-07-20",
    notas: "Artritis en rodillas",
  },
  {
    id: "hist-005",
    pacienteId: "pac-004",
    tipo: "personal",
    categoria: "enfermedad",
    descripcion: "Hipertiroidismo",
    fecha: "2012-05-05",
    notas: "Controlado con medicación",
  },
  {
    id: "hist-006",
    pacienteId: "pac-004",
    tipo: "familiar",
    categoria: "enfermedad",
    descripcion: "Cáncer de mama",
    parentesco: "Madre",
    notas: "Fallecida a los 65 años",
  },
  {
    id: "hist-007",
    pacienteId: "pac-002",
    tipo: "personal",
    categoria: "hospitalizacion",
    descripcion: "Parto natural",
    fecha: "2020-08-12",
    notas: "Sin complicaciones",
  },
]

// Vaccines
export const vaccines: Vaccine[] = [
  {
    id: "vac-001",
    pacienteId: "pac-001",
    nombre: "Influenza",
    fecha: "2024-10-15",
    dosis: "Única anual",
    lote: "FL2024-1234",
    proximaDosis: "2025-10-15",
    aplicadoPor: "Dra. Carmen A. Pérez",
  },
  {
    id: "vac-002",
    pacienteId: "pac-001",
    nombre: "COVID-19 (Refuerzo)",
    fecha: "2024-01-20",
    dosis: "4ta dosis",
    lote: "CV2024-5678",
    aplicadoPor: "Centro de Salud",
  },
  {
    id: "vac-003",
    pacienteId: "pac-003",
    nombre: "Influenza",
    fecha: "2024-10-20",
    dosis: "Única anual",
    lote: "FL2024-2345",
    proximaDosis: "2025-10-20",
    aplicadoPor: "Dra. Carmen A. Pérez",
  },
  {
    id: "vac-004",
    pacienteId: "pac-003",
    nombre: "Neumococo",
    fecha: "2023-05-10",
    dosis: "Única",
    lote: "PN2023-8901",
    aplicadoPor: "Centro de Salud",
    notas: "Recomendada por diabetes"
  },
  {
    id: "vac-005",
    pacienteId: "pac-004",
    nombre: "Influenza",
    fecha: "2024-09-30",
    dosis: "Única anual",
    lote: "FL2024-3456",
    proximaDosis: "2025-09-30",
    aplicadoPor: "Dra. Carmen A. Pérez",
  },
]

// Clinic-scoped data access functions

// Helper function to get patient by ID
export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id)
}

// Clinic-scoped data functions
export function getClinicPatients(clinicId: string): Patient[] {
  return patients.filter((p) => p.clinicId === clinicId)
}

export function getClinicAppointments(clinicId: string): Appointment[] {
  return appointments.filter((apt) => apt.clinicId === clinicId)
}

export function getClinicTodayAppointments(clinicId: string): (Appointment & { paciente: Patient })[] {
  const todayStr = formatDate(today)
  return getClinicAppointments(clinicId)
    .map((apt) => ({ ...apt, paciente: getPatientById(apt.pacienteId)! }))
    .filter((apt) => apt.fecha === todayStr && apt.paciente)
}

export function getGroupMetrics(groupId: string): GroupMetrics {
  const group = clinicGroups.find((g) => g.id === groupId)
  if (!group) {
    return {
      totalPatients: 0,
      totalAppointments: 0,
      appointmentsThisMonth: 0,
      completedAppointmentsThisMonth: 0,
      appointmentsByClinic: {},
    }
  }

  const allPatients = group.clinicIds.flatMap((cid) => getClinicPatients(cid))
  const allAppointments = group.clinicIds.flatMap((cid) => getClinicAppointments(cid))

  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const appointmentsThisMonth = allAppointments.filter((apt) => {
    const aptDate = new Date(apt.fecha)
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
  })

  const completedThisMonth = appointmentsThisMonth.filter((apt) => apt.estado === 'completada')

  return {
    totalPatients: allPatients.length,
    totalAppointments: allAppointments.length,
    appointmentsThisMonth: appointmentsThisMonth.length,
    completedAppointmentsThisMonth: completedThisMonth.length,
    appointmentsByClinic: Object.fromEntries(
      group.clinicIds.map((cid) => [cid, getClinicAppointments(cid).length])
    ),
  }
}

// Helper function to get appointments with patient data
export function getAppointmentsWithPatients(): (Appointment & { paciente: Patient })[] {
  return appointments
    .map((apt) => ({
      ...apt,
      paciente: getPatientById(apt.pacienteId)!,
    }))
    .filter((apt) => apt.paciente)
}

// Helper function to get today's appointments
export function getTodayAppointments(): (Appointment & { paciente: Patient })[] {
  const todayStr = formatDate(today)
  return getAppointmentsWithPatients().filter((apt) => apt.fecha === todayStr)
}

// Helper function to get patient's appointments
export function getPatientAppointments(pacienteId: string): Appointment[] {
  return appointments.filter((apt) => apt.pacienteId === pacienteId)
}

// Helper function to get patient's consultation notes
export function getPatientConsultationNotes(pacienteId: string): ConsultationNote[] {
  return consultationNotes.filter((note) => note.pacienteId === pacienteId)
}

// Helper function to get patient's attachments
export function getPatientAttachments(pacienteId: string): MedicalAttachment[] {
  return medicalAttachments.filter((att) => att.pacienteId === pacienteId)
}

// Helper function to get conversations with patient data
export function getConversationsWithPatients(): (WhatsAppConversation & { paciente: Patient })[] {
  return whatsappConversations
    .map((conv) => ({
      ...conv,
      paciente: getPatientById(conv.pacienteId)!,
    }))
    .filter((conv) => conv.paciente)
}

// Helper to count unread notifications
export function getUnreadNotificationsCount(): number {
  return notifications.filter((n) => !n.leida).length
}

// Helper function to get patient's vital signs
export function getPatientVitalSigns(pacienteId: string): VitalSigns[] {
  return vitalSigns.filter((vs) => vs.pacienteId === pacienteId)
}

// Helper function to get patient's medical history
export function getPatientMedicalHistory(pacienteId: string): MedicalHistory[] {
  return medicalHistory.filter((mh) => mh.pacienteId === pacienteId)
}

// Helper function to get patient's vaccines
export function getPatientVaccines(pacienteId: string): Vaccine[] {
  return vaccines.filter((v) => v.pacienteId === pacienteId)
}

// Clinic-scoped notification functions
export function getClinicNotifications(clinicId: string): Notification[] {
  return notifications.filter((n) => n.clinicId === clinicId)
}

export function getClinicUnreadNotifications(clinicId: string): Notification[] {
  return getClinicNotifications(clinicId).filter((n) => !n.leida)
}

// Clinic-scoped conversation functions
export function getClinicConversations(clinicId: string): WhatsAppConversation[] {
  return whatsappConversations.filter((c) => c.clinicId === clinicId)
}

export function getClinicConversationsWithPatients(clinicId: string): (WhatsAppConversation & { paciente: Patient })[] {
  return getClinicConversations(clinicId)
    .map((conv) => ({
      ...conv,
      paciente: getPatientById(conv.pacienteId)!,
    }))
    .filter((conv) => conv.paciente)
}

