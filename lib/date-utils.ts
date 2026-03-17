// Consistent date formatting utilities to avoid hydration mismatches
// These functions use manual formatting instead of toLocaleDateString
// to ensure consistent output between server and client

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]

const MESES_CORTO = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
]

const DIAS_SEMANA = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
]

/**
 * Format: "15 de marzo de 2024"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const day = d.getDate()
  const month = MESES[d.getMonth()]
  const year = d.getFullYear()
  return `${day} de ${month} de ${year}`
}

/**
 * Format: "lunes, 15 de marzo de 2024"
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const weekday = DIAS_SEMANA[d.getDay()]
  const day = d.getDate()
  const month = MESES[d.getMonth()]
  const year = d.getFullYear()
  return `${weekday}, ${day} de ${month} de ${year}`
}

/**
 * Format: "15/03/2024"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format: "15 mar 2024"
 */
export function formatDateMedium(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const day = d.getDate()
  const month = MESES_CORTO[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Format: "14:30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Format: "hace 5 minutos", "hace 2 horas", "hace 3 días"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return "hace un momento"
  } else if (diffMinutes < 60) {
    return `hace ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  } else if (diffDays < 7) {
    return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
  } else {
    return formatDateShort(d)
  }
}

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
