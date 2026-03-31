# Plan 03 Summary: Migrate Forms and Calendar to Axios

**Status:** ✅ COMPLETED
**Date:** 2026-03-31

## What was done

### Task 1: New patient form (`app/(app)/pacientes/nuevo/page.tsx`)
- Added `import { apiClient } from '@/lib/api-client'`
- Replaced `fetch('/api/patients', { method: 'POST', ... })` with `apiClient.post('/api/patients', data)`
- Removed manual 401/403 handling — interceptors handle this automatically
- Removed `session`, `signOut`, `authLoading` from `useAuth()` destructuring
- Removed `useEffect` for auth redirect — interceptor now handles 401
- Removed unused `useEffect` import
- Success toast and redirect preserved

### Task 2: New appointment form (`app/(app)/calendario/nueva-cita/page.tsx`)
- Added `import { apiClient } from '@/lib/api-client'`
- Replaced `fetch('/api/patients', ...)` (GET) with `apiClient.get('/api/patients')`
- Replaced `fetch('/api/appointments', { method: 'POST', ... })` with `apiClient.post('/api/appointments', data)`
- Removed manual 401/403 handling and auth redirect logic
- Simplified `fetchPatients` callback — no session dependency
- `useEffect` simplified to depend on `user` only

### Task 3: Calendar page (`app/(app)/calendario/page.tsx`)
- Added `import { apiClient } from '@/lib/api-client'`
- Replaced both `fetch('/api/appointments', ...)` and `fetch('/api/patients', ...)` with `apiClient.get()`
- Removed manual 401/403 handling and auth redirect logic
- Removed unused `useRouter`, `useRouter` import, `authLoading`, `signOut`, `session`
- `useEffect` simplified to depend on `user` only

## Additional pages migrated (discovered during audit)

### `app/(app)/calendario/cita/[id]/page.tsx`
- GET appointment, GET patient, PATCH appointment status — all migrated to axios
- Removed `useCallback` for auth headers (no longer needed)
- Proper error formatting with `formatErrorMessage`

### `app/(app)/clinics/[clinicId]/calendario/page.tsx`
- Both fetch calls migrated to `apiClient.get()`
- Fixed pre-existing type errors (`pacienteId` → `patient_id`, `paciente` → `patient`, sort safety)
- Calendar dot rendering simplified

### `app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx`
- GET patients and POST appointment migrated
- Fixed pre-existing `patient.nombre`/`patient.apellido` → `patient.full_name`

### `app/(app)/clinics/[clinicId]/pacientes/page.tsx`
- GET patients migrated
- Fixed all pre-existing Spanish field name mismatches

### `app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx`
- POST patient migrated
- Maps legacy form fields to correct `Patient` type fields (`full_name`, `phone`, etc.)
