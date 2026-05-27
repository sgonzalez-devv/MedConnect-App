/** Strip all characters that aren't valid in a phone number */
export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+\-\s().]/g, "")
}

/** Returns true if the phone string is long enough to be valid */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "")
  return digits.length >= 7
}

/** Basic email regex validation */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
