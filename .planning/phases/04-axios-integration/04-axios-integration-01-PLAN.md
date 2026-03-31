---
phase: 04-axios-integration
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [
  "package.json",
  "lib/api-client.ts",
  "lib/error-handling.ts"
]
autonomous: true
requirements: [AXIOS-01, AXIOS-02, AXIOS-03, AXIOS-04, AXIOS-05]
user_setup: []

must_haves:
  truths:
    - "Axios is installed as a project dependency"
    - "A configured axios instance exists with request/response interceptors"
    - "Request interceptor attaches auth token from session"
    - "Response interceptor handles 401 (redirect to login) and 403 (permission denied)"
    - "Automatic retry logic exists for transient 5xx errors"
    - "Existing fetch-based calls can be migrated to use the axios client"
  artifacts:
    - path: "lib/api-client.ts"
      provides: "Axios client instance with interceptors and retry logic"
      exports: ["apiClient", "retryConfig", "handleAuthError", "handleClinicIsolationError"]
      min_lines: 150
  key_links:
    - from: "lib/api-client.ts"
      to: "lib/error-handling.ts"
      via: "Error conversion functions"
      pattern: "import.*formatErrorMessage"
    - from: "frontend pages"
      to: "lib/api-client.ts"
      via: "Import and use apiClient instead of fetch"
      pattern: "import.*apiClient.*from"

---

# Plan 1: Axios Installation & Client Configuration

Install axios and create a configured client instance with request/response interceptors for auth handling, clinic isolation errors, and automatic retry logic.

**Purpose:** Establish the foundation for migrating from native `fetch` to axios with proper interceptors and error handling.

**Output:** 
- `package.json` updated with axios dependency
- `lib/api-client.ts` with configured axios instance

**Depends on:** Nothing (this phase is independent)

---

## Context

### Existing Pattern (fetch)
```typescript
const res = await fetch("/api/patients", {
  headers: { 'Authorization': `Bearer ${session?.access_token}` },
})
if (!res.ok) {
  const errData = await res.json().catch(() => ({}))
  throw new Error(errData.error || `HTTP ${res.status}`)
}
const json = await res.json()
```

### New Pattern (axios)
```typescript
import { apiClient } from '@/lib/api-client'

// Instead of fetch, use apiClient
const { data } = await apiClient.get('/api/patients')
```

### What Interceptors Provide
- **Request:** Automatically attach `Authorization: Bearer {token}` header
- **Response:** 
  - 401 → redirect to login
  - 403 → show permission denied toast
  - 5xx → retry with exponential backoff

---

## Tasks

<task type="auto">
  <name>Task 1: Install axios dependency</name>
  <files>package.json</files>
  <action>
Install axios and its TypeScript types:

1. Add to package.json dependencies:
   ```json
   "axios": "^1.7.0"
   ```

2. Install via pnpm:
   ```
   pnpm add axios
   ```

This provides the HTTP client foundation. Version ^1.7.0 ensures latest features while maintaining stability.
  </action>
  <verify>
    <automated>
      grep -q '"axios"' package.json && echo "PASS: axios in dependencies" || echo "FAIL: axios missing"
    </automated>
  </verify>
  <done>axios ^1.7.0 added to package.json dependencies; pnpm install completed</done>
</task>

<task type="auto">
  <name>Task 2: Create axios client with interceptors (lib/api-client.ts)</name>
  <files>lib/api-client.ts</files>
  <action>
Create `lib/api-client.ts` with:

1. **Axios instance configuration:**
   ```typescript
   import axios from 'axios'
   
   const apiClient = axios.create({
     baseURL: '',  // Uses relative URLs for Next.js API routes
     timeout: 10000,
     withCredentials: true,  // Include cookies for SSR
   })
   ```

2. **Request interceptor to attach auth token:**
   ```typescript
   apiClient.interceptors.request.use(
     async (config) => {
       // Get token from cookie or session storage
       const token = getAuthToken() // Implement getAuthToken()
       if (token) {
         config.headers.Authorization = `Bearer ${token}`
       }
       return config
     },
     (error) => Promise.reject(error)
   )
   ```

3. **Response interceptor for error handling:**
   ```typescript
   apiClient.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config
       
       // Handle 401 - session expired
       if (error.response?.status === 401) {
         // Clear session and redirect to login
         await handleAuthError()
         return Promise.reject(error)
       }
       
       // Handle 403 - clinic isolation violation
       if (error.response?.status === 403) {
         handleClinicIsolationError()
         return Promise.reject(error)
       }
       
       // Retry logic for 5xx errors (only for GET requests)
       if (isRetryableError(error) && !originalRequest._retry) {
         originalRequest._retry = true
         return retryRequest(originalRequest)
       }
       
       return Promise.reject(error)
     }
   )
   ```

4. **Helper functions:**
   - `getAuthToken()`: Extract token from cookies using js-cookie or document.cookie
   - `handleAuthError()`: Clear session, show toast, redirect to /auth/login
   - `handleClinicIsolationError()`: Show permission denied toast
   - `isRetryableError(error)`: Returns true for 5xx status or network timeout
   - `retryRequest(config)`: Exponential backoff retry (max 3 attempts, 1s, 2s, 4s delays)

5. **Export the configured client:**
   ```typescript
   export { apiClient }
   export { getAuthToken, handleAuthError, handleClinicIsolationError }
   export type { AxiosRequestConfig, AxiosResponse, AxiosError }
   ```

6. **Integration with existing error handling:**
   - Import `formatErrorMessage` from `lib/error-handling.ts`
   - Convert axios errors to same format as existing error handling
   - This ensures consistent error messages for users
  </action>
  <verify>
    <automated>
      grep -q "interceptors.request" lib/api-client.ts && echo "PASS: Request interceptor" || echo "FAIL"
      grep -q "interceptors.response" lib/api-client.ts && echo "PASS: Response interceptor" || echo "FAIL"
      grep -q "export.*apiClient" lib/api-client.ts && echo "PASS: Export" || echo "FAIL"
      wc -l lib/api-client.ts | grep -E "[1-5][0-9]{2}"
    </automated>
  </verify>
  <done>lib/api-client.ts exists with configured axios instance, request interceptor (attaches Bearer token), response interceptor (handles 401/403/retry), and all helper functions; exports apiClient for use by frontend</done>
</task>

<task type="auto">
  <name>Task 3: Update error handling for axios compatibility</name>
  <files>lib/error-handling.ts</files>
  <action>
Update `lib/error-handling.ts` to add axios-specific error handling:

1. Add axios error detection function:
   ```typescript
   import { AxiosError } from 'axios'
   
   /**
    * Check if error is from axios
    */
   export function isAxiosError(error: unknown): error is AxiosError {
     return error instanceof Error && 'isAxiosError' in error
   }
   
   /**
    * Extract error message from axios error
    */
   export function getAxiosErrorMessage(error: unknown): string {
     if (isAxiosError(error)) {
       return error.response?.data?.error || 
              error.message || 
              `HTTP ${error.response?.status}`
     }
     return error instanceof Error ? error.message : 'Unknown error'
   }
   ```

2. Update `formatErrorMessage` to handle axios errors:
   ```typescript
   export function formatErrorMessage(error: unknown, context?: string): string {
     if (isAxiosError(error)) {
       const status = error.response?.status
       const serverMessage = error.response?.data?.error
       
       // Map axios status codes to user-friendly messages
       if (status === 401) return 'Your session has expired. Please log in again.'
       if (status === 403) return 'You do not have permission to perform this action.'
       if (status === 404) return serverMessage || 'The requested resource was not found.'
       if (status === 422) return serverMessage || 'The data provided is invalid.'
       if (status === 500) return 'A server error occurred. Please try again later.'
       
       return serverMessage || `Request failed (${status})`
     }
     
     // ... existing error handling for other error types
   }
   ```

3. Keep existing functions unchanged (isAuthError, isClinicIsolationError, etc.) — they work with both fetch and axios errors.

This ensures backward compatibility: existing code using formatErrorMessage continues to work, and axios errors are properly formatted.
  </action>
  <verify>
    <automated>
      grep -q "isAxiosError" lib/error-handling.ts && echo "PASS: axios detection" || echo "FAIL"
      grep -q "getAxiosErrorMessage" lib/error-handling.ts && echo "PASS: axios message extraction" || echo "FAIL"
    </automated>
  </verify>
  <done>lib/error-handling.ts updated with isAxiosError() and getAxiosErrorMessage() functions; formatErrorMessage() handles both fetch and axios errors; existing functions unchanged for backward compatibility</done>
</task>

</tasks>

<verification>
- [ ] package.json contains axios dependency
- [ ] lib/api-client.ts exists with configured axios instance
- [ ] Request interceptor attaches Authorization Bearer token
- [ ] Response interceptor handles 401 (session expired)
- [ ] Response interceptor handles 403 (permission denied)
- [ ] Retry logic exists for 5xx errors on GET requests
- [ ] lib/error-handling.ts updated for axios compatibility
- [ ] All exports are available for frontend migration
</verification>

<success_criteria>
- Axios installed as project dependency
- lib/api-client.ts exports a configured axios instance
- Request interceptor automatically attaches auth token
- Response interceptor handles 401, 403, and retry logic
- Error handling updated to work with axios errors
- Migration path clear for frontend pages to switch from fetch to axios
</success_criteria>

<output>
After completion, create `.planning/phases/04-axios-integration/04-axios-integration-01-SUMMARY.md`
</output>
