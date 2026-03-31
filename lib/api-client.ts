/**
 * Axios API Client
 *
 * This client is configured with interceptors for:
 * - Automatic auth token attachment from Supabase session (via cookie-based storage)
 * - 401 handling (session expiry → redirect to login)
 * - 403 handling (permission denied → toast)
 * - Automatic retry for 5xx errors (GET requests only, max 3 attempts with exponential backoff)
 *
 * Migration from fetch:
 * Before: fetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } })
 * After:  apiClient.get('/api/patients')
 *
 * @requirement AXIOS-01, AXIOS-02, AXIOS-03, AXIOS-04, AXIOS-05
 */

import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { formatErrorMessage } from '@/lib/error-handling'

// Re-export types for consumers
export type { AxiosRequestConfig, AxiosResponse, AxiosError }

// ---------------------------------------------------------------------------
// Retry configuration
// ---------------------------------------------------------------------------
export const retryConfig = {
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000], // ms — exponential backoff
  retryableStatuses: [500, 502, 503, 504],
  retryableMethods: ['get', 'GET'],
}

// Internal type to track retry state on request config
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Reads the Supabase access token stored in the browser.
 *
 * Supabase SSR stores the session as a JSON-encoded cookie whose name begins
 * with "sb-" and ends with "-auth-token". We look for that cookie and parse
 * the access_token out of it.  Falls back to sessionStorage / localStorage
 * for non-SSR Supabase clients.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  // 1. Try cookies (Supabase SSR @supabase/ssr pattern)
  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split('=')
      if (name && name.startsWith('sb-') && name.endsWith('-auth-token')) {
        const raw = decodeURIComponent(valueParts.join('='))
        // Value might be a JSON array [accessToken, refreshToken] or a JSON object
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed[0]) return parsed[0]
        if (parsed?.access_token) return parsed.access_token
      }
    }
  } catch {
    // ignore parse errors
  }

  // 2. Try localStorage keys used by supabase-js v2 directly
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.access_token) return parsed.access_token
        }
      }
    }
  } catch {
    // ignore
  }

  return null
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/**
 * Handles a 401 response: clears session, shows toast, redirects to login.
 * Dispatches a custom DOM event so any mounted React component can react too.
 */
export async function handleAuthError(): Promise<void> {
  if (typeof window === 'undefined') return

  // Fire a custom event that the auth context can listen to
  window.dispatchEvent(new CustomEvent('auth:session-expired'))

  // Redirect only if not already on the login page
  if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth/')) {
    window.location.href = '/login'
  }
}

/**
 * Handles a 403 response: shows a permission-denied toast via the sonner event bus.
 * Dispatches a custom DOM event so mounted components can show a toast.
 */
export function handleClinicIsolationError(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('auth:permission-denied', {
      detail: { message: 'No tienes permiso para realizar esta acción.' },
    })
  )
}

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

function isRetryableError(error: AxiosError): boolean {
  if (!error.response) return true // Network timeout / no response
  return retryConfig.retryableStatuses.includes(error.response.status)
}

function isRetryableMethod(config: AxiosRequestConfig | undefined): boolean {
  if (!config?.method) return false
  return retryConfig.retryableMethods.includes(config.method.toUpperCase())
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retryRequest(
  config: RetryableRequestConfig
): Promise<AxiosResponse> {
  const retryCount = config._retryCount ?? 0
  const waitMs = retryConfig.retryDelays[retryCount] ?? 4000
  await delay(waitMs)
  config._retryCount = retryCount + 1
  return apiClient(config)
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: '',        // Use relative URLs — works with Next.js API routes
  timeout: 10000,     // 10 s request timeout
  withCredentials: true, // Send cookies with every request (SSR support)
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---------------------------------------------------------------------------
// Request interceptor — attach Authorization header
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 / 403 / 5xx retry
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  // Success: pass through
  (response) => response,

  // Error: handle or retry
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    // --- 401: Session expired ---
    if (error.response?.status === 401) {
      await handleAuthError()
      return Promise.reject(error)
    }

    // --- 403: Permission denied ---
    if (error.response?.status === 403) {
      handleClinicIsolationError()
      return Promise.reject(error)
    }

    // --- 5xx: Retry with exponential backoff (GET only) ---
    if (
      originalRequest &&
      isRetryableError(error) &&
      isRetryableMethod(originalRequest) &&
      (originalRequest._retryCount ?? 0) < retryConfig.maxRetries
    ) {
      return retryRequest(originalRequest)
    }

    return Promise.reject(error)
  }
)

export { apiClient }

/**
 * Convenience wrapper: extracts a user-friendly message from an axios error
 * (delegates to the existing formatErrorMessage utility).
 */
export function getAxiosErrorMessage(error: unknown): string {
  return formatErrorMessage(error, undefined)
}
