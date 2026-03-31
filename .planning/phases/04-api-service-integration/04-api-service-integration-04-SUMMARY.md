---
phase: 04-api-service-integration
plan: 04
subsystem: frontend
tags: [frontend-forms, form-submission, calendar, appointments, patients, api-integration, loading-states, error-handling]
dependency_graph:
  requires: [04-api-service-integration-02]
  provides: [appointment-form-submission, patient-form-submission, calendar-real-data, clinic-context-validation]
  affects: [user-experience, form-workflows, data-persistence]
tech_stack:
  added: []
  patterns: [form-submission-fetch, loading-state-spinners, error-toast-notifications, clinic-isolation-verification]
key_files:
  created: []
  modified:
    - app/(app)/calendario/page.tsx
    - app/(app)/calendario/nueva-cita/page.tsx
    - app/(app)/pacientes/nuevo/page.tsx
    - app/(app)/clinics/[clinicId]/calendario/page.tsx
    - app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx
    - app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx
  referenced:
    - hooks/use-auth.ts
    - lib/error-handling.ts
    - lib/types.ts
    - app/api/appointments/route.ts
    - app/api/patients/route.ts
decisions:
  - "Form submissions use fetch() with Content-Type: application/json and clinic_id from auth context"
  - "Calendar loads real appointments via GET /api/appointments (not mock data)"
  - "Loading states use spinner/disabled button while submission in progress"
  - "Error handling differentiates between 401 (session expired), 403 (forbidden), and server errors (500)"
  - "Clinic-specific routes verify user has access to requested clinic before allowing form submission"
metrics:
  duration: ~15 minutes
  completed: "2026-03-31"
  tasks_completed: 3
  files_modified: 6
---

# Phase 04 Plan 04: Frontend Forms & Calendar Integration Summary

**One-liner:** Connected appointment and patient forms to POST /api/* endpoints with real submission, loading states, and error handling; calendar loads real appointments from database.

## What Was Built

Three critical form flows now write data to Supabase:

### Task 1: Calendar & Appointment Form Integration
- **Calendar page** (`app/(app)/calendario/page.tsx`): Loads real appointments from `/api/appointments` instead of mock data
  - Added `useEffect` with `fetch()` to load appointments on mount
  - Added loading state with spinner while fetching
  - Added error handling with toast notifications
  - Calendar renders real appointment data
  - "New Appointment" button links to form page

- **New appointment form** (`app/(app)/calendario/nueva-cita/page.tsx`): Submits new appointments to API
  - Updated `onSubmit` handler to POST to `/api/appointments`
  - Added `clinic_id` from `useAuth()` context (not user input)
  - Added loading state: disable submit button, show spinner while submitting
  - On success (201): Show "Appointment created" toast, redirect to `/calendario`
  - On error: Show formatted error message in toast
  - On 401: Log out user, redirect to `/auth/login` with "Session expired" message
  - On 403: Show "Permission denied" error
  - Added client-side validation: appointment date must be in future
  - Added patient dropdown fetch: loads patients from `/api/patients` for selection

### Task 2: Patient Form Integration
- **New patient form** (`app/(app)/pacientes/nuevo/page.tsx`): Submits new patients to API
  - Updated `onSubmit` handler to POST to `/api/patients`
  - Added `clinic_id` from `useAuth()` context
  - Added loading state: disable submit button, show spinner while submitting
  - On success (201): Show "Patient created" toast, redirect to `/pacientes`
  - On error: Show formatted error message in toast
  - Handle 401 (session expired) and 403 (forbidden) same as appointment form
  - Form includes required fields: name, email, phone, birthdate, gender, address
  - Form includes optional fields: allergies, chronic conditions, blood type
  - Added client-side validation: email format, phone format, birthdate in past
  - Added "Back" button to cancel and return to patient list

### Task 3: Clinic-Specific Forms
- **Clinic-specific appointment form** (`app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx`): POSTs to `/api/appointments`
  - Extracts `clinicId` from route params
  - Verifies user has access to clinic (compares `useAuth().clinic_id` with route `clinicId`)
  - If mismatch: shows error toast and prevents submission
  - Otherwise: submits with `clinic_id` from URL params

- **Clinic-specific patient form** (`app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx`): POSTs to `/api/patients`
  - Extracts `clinicId` from route params
  - Verifies user has access to clinic before allowing submission
  - Shows error if user tries to create patient in clinic they don't belong to

- **Clinic-specific calendar page** (`app/(app)/clinics/[clinicId]/calendario/page.tsx`): Loads clinic appointments
  - Fetches appointments filtered by clinic context
  - Verifies user clinic access before displaying

## Data Flow Pattern

All form submissions follow:
```
User fills form
  → onClick submit
    → useAuth() → get clinic_id
      → validate form with Zod (client-side)
        → fetch('POST /api/...') with {formData, clinic_id}
          → if response.ok (201): toast.success() → router.push()
          → else if 401: logout() → router.push('/auth/login')
          → else if 403: toast.error("Permission denied")
          → else: toast.error(error.message)
```

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all form submission flows completed as planned.

## Files Modified

1. `app/(app)/calendario/page.tsx` - Load appointments from API with useEffect
2. `app/(app)/calendario/nueva-cita/page.tsx` - POST appointment form to API
3. `app/(app)/pacientes/nuevo/page.tsx` - POST patient form to API
4. `app/(app)/clinics/[clinicId]/calendario/page.tsx` - Clinic-specific calendar
5. `app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx` - Clinic-specific appointment form
6. `app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx` - Clinic-specific patient form

## Verification Results

✅ **Task 1 Complete:** Calendar loads real appointments; appointment form submits to API; loading state shown; errors displayed; success redirect works
✅ **Task 2 Complete:** Patient form submits to API; loading state shown; errors displayed; validation works; success redirect works
✅ **Task 3 Complete:** Clinic-specific forms verify access; correct clinic_id sent to API; clinic isolation enforced

## Checkpoint Approval

✅ **Human verification approved:** Forms are ready for production
- Tested form submission workflows
- Verified error handling (401, 403, server errors)
- Confirmed clinic isolation checks work
- Validated loading states and user feedback

## Next Phase Readiness

All form submission flows now write to database. Users can:
- View real appointments in calendar
- Create new appointments via form
- Create new patients via form
- Access clinic-specific forms with isolation verification

No external setup required - all API endpoints exist from Plan 02.

## Commits

| Hash | Task | Message |
|------|------|---------|
| `dcfefd8` | 1 | `feat(04-api-service-integration-04): connect calendar and appointment form to API` |
| `e1691ea` | 2 | `feat(04-api-service-integration-04): connect patient form to API` |
| `0a27501` | 3 | `feat(04-api-service-integration-04): connect clinic-specific forms to API` |

---

*Phase: 04-api-service-integration*
*Completed: 2026-03-31*
*Status: Ready for Phase verification*
