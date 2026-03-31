# Plan 02 Summary: Migrate Dashboard and Patient Pages to Axios

**Status:** ✅ COMPLETED
**Date:** 2026-03-31

## What was done

### Task 1: Dashboard page (`app/(app)/dashboard/page.tsx`)
- Added `import { apiClient } from '@/lib/api-client'`
- Replaced two parallel `fetch()` calls with `Promise.all([apiClient.get(...), apiClient.get(...)])`
- Removed manual `Authorization` header — interceptor handles it
- Removed manual `res.ok` checks — axios throws on non-2xx
- Removed `session` from `useAuth()` destructuring (no longer needed)
- `useEffect` dependency array simplified to `[user?.clinic_id]`

### Task 2: Patient list page (`app/(app)/pacientes/page.tsx`)
- Added `import { apiClient } from '@/lib/api-client'`
- Replaced `fetch("/api/patients", { headers })` with `apiClient.get("/api/patients")`
- Removed manual `res.ok` check and error parsing
- Removed `session` from `useAuth()` destructuring
- Search/filter logic and view mode toggle unchanged

### Task 3: Patient detail page (`app/(app)/pacientes/[id]/page.tsx`)
- Added `import { apiClient } from '@/lib/api-client'`
- Replaced `fetch(`/api/patients/${id}`, ...)` with `apiClient.get(`/api/patients/${id}`)`
- Removed manual `res.ok` / 404 check — axios throws and 404 is caught in catch block
- Removed `session` from `useAuth()` destructuring
- Clinic isolation check preserved
- Simplified `useEffect` dependency array (removed `session?.access_token`)
