# Plan 01 Summary: Axios Installation & Client Configuration

**Status:** ✅ COMPLETED
**Date:** 2026-03-31

## What was done

### Task 1: Install axios dependency
- `axios@1.14.0` installed via `pnpm add axios`
- Added to `package.json` dependencies

### Task 2: Create `lib/api-client.ts`
Created a fully configured axios instance with:
- `baseURL: ''` — uses relative URLs for Next.js API routes
- `timeout: 10000` — 10s request timeout
- `withCredentials: true` — includes cookies for SSR
- **Request interceptor**: calls `getAuthToken()` to read the Supabase session token from cookies/localStorage and attaches `Authorization: Bearer {token}` header automatically
- **Response interceptor**:
  - `401` → calls `handleAuthError()` which fires `auth:session-expired` DOM event and redirects to `/login`
  - `403` → calls `handleClinicIsolationError()` which fires `auth:permission-denied` DOM event
  - `5xx` on GET requests → automatic retry with exponential backoff (1s, 2s, 4s), max 3 retries
- Exports: `apiClient`, `getAuthToken`, `handleAuthError`, `handleClinicIsolationError`, `retryConfig`, `getAxiosErrorMessage`

### Task 3: Update `lib/error-handling.ts`
- Added `isAxiosError()` type guard
- Added `getAxiosErrorMessage()` to extract user-friendly messages from axios errors
- Updated `formatErrorMessage()` to handle axios errors first (precise HTTP status-based messages)
- All existing functions unchanged for backward compatibility
