/**
 * Error Handling Utilities for API Service Layer
 * 
 * This module provides functions to:
 * - Detect and categorize Supabase errors
 * - Handle different error types: Auth, Clinic isolation, Validation, Connection
 * - Format error messages for user display
 * - Log errors for debugging
 * 
 * @requirement ERR-01, ERR-02, ERR-03, ERR-04, ERR-05
 */

import { PostgrestError } from '@supabase/supabase-js'

/**
 * Error response interface for consistent API error handling
 * 
 * @requirement ERR-01
 */
export interface ErrorResponse {
  code: string
  message: string
  details?: unknown
  timestamp: string
}

/**
 * Detects if an error is an authentication error (401 or expired session)
 * 
 * Handles:
 * - "JWT expired" errors
 * - "Invalid claim in access token" errors
 * - 401 Unauthorized status codes
 * - Session expiration indicators
 * 
 * @param error - Supabase error or unknown error
 * @returns true if error is auth-related
 * 
 * @requirement ERR-02
 * @example
 * const error = new Error("JWT expired");
 * isAuthError(error) // true
 * 
 * @example
 * const supabaseError = { code: 'PGRST301', status: 401 };
 * isAuthError(supabaseError) // true
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false

  // Check PostgreSQL/Supabase error
  if (typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase()
    if (message.includes('jwt') && message.includes('expired')) return true
    if (message.includes('invalid claim')) return true
    if (message.includes('unauthorized')) return true
  }

  // Check status code
  if (typeof error === 'object' && 'status' in error) {
    if (error.status === 401) return true
  }

  // Check for Supabase auth error codes
  if (typeof error === 'object' && 'code' in error) {
    const code = String(error.code)
    if (code === 'PGRST301') return true // Unauthorized
  }

  return false
}

/**
 * Detects if an error is a clinic isolation/RLS violation error
 * 
 * Handles:
 * - "violates row level security policy" errors
 * - 403 Forbidden status codes
 * - RLS policy violation messages
 * 
 * @param error - Supabase error or unknown error
 * @returns true if error is clinic isolation related
 * 
 * @requirement ERR-03
 * @example
 * const error = new Error("new row violates row level security policy");
 * isClinicIsolationError(error) // true
 */
export function isClinicIsolationError(error: unknown): boolean {
  if (!error) return false

  // Check message for RLS violation
  if (typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase()
    if (message.includes('row level security') || message.includes('rls')) {
      return true
    }
    if (message.includes('violates row security')) return true
  }

  // Check status code for Forbidden
  if (typeof error === 'object' && 'status' in error) {
    if (error.status === 403) return true
  }

  // Check for Supabase policy violation codes
  if (typeof error === 'object' && 'code' in error) {
    const code = String(error.code)
    if (code === 'PGRST303') return true // Forbidden
  }

  return false
}

/**
 * Detects if an error is a validation/constraint error
 * 
 * Handles:
 * - Check constraint violations
 * - NOT NULL constraint violations
 * - Unique constraint violations
 * - Data type mismatches
 * 
 * @param error - Supabase error or unknown error
 * @returns true if error is validation related
 * 
 * @requirement ERR-04
 * @example
 * const error = new Error("new row violates check constraint 'clinic_id_required'");
 * isValidationError(error) // true
 * 
 * @example
 * const error = new Error("duplicate key value violates unique constraint");
 * isValidationError(error) // true
 */
export function isValidationError(error: unknown): boolean {
  if (!error) return false

  if (typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase()

    // Check constraint violations
    if (message.includes('check constraint') || message.includes('violates check')) return true
    if (message.includes('not null') || message.includes('null constraint')) return true
    if (message.includes('unique constraint') || message.includes('duplicate key')) return true
    if (message.includes('foreign key') || message.includes('violates foreign')) return true

    // Data type errors
    if (message.includes('invalid') && message.includes('format')) return true
  }

  // Check status code for Bad Request
  if (typeof error === 'object' && 'status' in error) {
    if (error.status === 400) return true
  }

  return false
}

/**
 * Detects if an error is a connection/server error
 * 
 * @param error - Supabase error or unknown error
 * @returns true if error is connection related
 * 
 * @requirement ERR-05
 * @example
 * const error = new Error("Failed to fetch");
 * isConnectionError(error) // true
 */
export function isConnectionError(error: unknown): boolean {
  if (!error) return false

  if (typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase()
    if (message.includes('failed to fetch')) return true
    if (message.includes('network error')) return true
    if (message.includes('connection')) return true
    if (message.includes('timeout')) return true
  }

  // Check status code for server errors
  if (typeof error === 'object' && 'status' in error) {
    const status = error.status
    if (typeof status === 'number' && status >= 500) return true
  }

  return false
}

/**
 * Formats an error into a user-friendly message
 * 
 * Never exposes raw database errors. Translates technical errors into
 * messages that users can understand.
 * 
 * @param error - Supabase error or unknown error
 * @param context - Optional context about what operation was attempted
 * @returns User-friendly error message
 * 
 * @requirement ERR-01, ERR-02, ERR-03, ERR-04, ERR-05
 * @example
 * const error = new Error("JWT expired");
 * formatErrorMessage(error, "Fetching patients")
 * // Returns: "Your session has expired. Please log in again."
 * 
 * @example
 * const error = new Error("new row violates row level security policy");
 * formatErrorMessage(error, "Creating patient")
 * // Returns: "You don't have permission to access this resource. Please contact your clinic administrator."
 * 
 * @example
 * const error = new Error("new row violates check constraint 'clinic_id_required'");
 * formatErrorMessage(error, "Creating patient")
 * // Returns: "Missing required information. Please ensure all required fields are filled."
 */
export function formatErrorMessage(error: unknown, context?: string): string {
  // Auth errors
  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.'
  }

  // Clinic isolation errors
  if (isClinicIsolationError(error)) {
    return 'You don\'t have permission to access this resource. Please contact your clinic administrator.'
  }

  // Validation errors
  if (isValidationError(error)) {
    return 'Missing required information or invalid data. Please check your entries and try again.'
  }

  // Connection errors
  if (isConnectionError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  // Fallback: generic error
  return 'An unexpected error occurred. Please try again or contact support.'
}

/**
 * Main error handler for Supabase operations
 * 
 * Logs the error with context, categorizes it, and returns a formatted message.
 * This function should be called in every try-catch block that handles Supabase errors.
 * 
 * @param error - The error from Supabase
 * @param context - Context about the operation (e.g., "Fetching patients list", "Creating patient")
 * @returns ErrorResponse with categorized error information
 * 
 * @requirement ERR-01, ERR-02, ERR-03, ERR-04, ERR-05
 * @example
 * try {
 *   const { data, error } = await supabase.from('patients').select()
 *   if (error) {
 *     const errorResponse = handleSupabaseError(error, "Fetching patients")
 *     throw new Error(errorResponse.message)
 *   }
 * } catch (err) {
 *   const errorResponse = handleSupabaseError(err, "Fetching patients")
 *   console.error(errorResponse)
 * }
 */
export function handleSupabaseError(
  error: unknown,
  context: string = 'API operation'
): ErrorResponse {
  const timestamp = new Date().toISOString()

  // Determine error code
  let code = 'UNKNOWN_ERROR'
  if (isAuthError(error)) code = 'AUTH_ERROR'
  else if (isClinicIsolationError(error)) code = 'CLINIC_ISOLATION_ERROR'
  else if (isValidationError(error)) code = 'VALIDATION_ERROR'
  else if (isConnectionError(error)) code = 'CONNECTION_ERROR'

  // Get formatted message
  const message = formatErrorMessage(error, context)

  // Log error with context for debugging
  console.error(`[${code}] ${context}:`, error)

  return {
    code,
    message,
    details: error instanceof Error ? error.message : String(error),
    timestamp,
  }
}

/**
 * Type guard to check if error is a PostgrestError (Supabase specific)
 * 
 * @param error - Error to check
 * @returns true if error is a PostgrestError
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}
