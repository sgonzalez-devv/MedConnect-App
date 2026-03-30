---
phase: 04-api-service-integration
plan: 03
subsystem: frontend
tags: [frontend-integration, api-fetch, dashboard, patients, clinic-isolation, loading-states]
dependency_graph:
  requires: [04-api-service-integration-02]
  provides: [dashboard-real-data, patient-list-real-data, patient-detail-real-data]
  affects: [user-experience, clinic-isolation]
tech_stack:
  added: []
  patterns: [useEffect-fetch, useAuth-clinic-context, sonner-toast-errors, loading-skeletons]
key_files:
  created: []
  modified:
    - app/(app)/dashboard/page.tsx
    - app/(app)/pacientes/page.tsx
    - app/(app)/pacientes/[id]/page.tsx
    - app/(app)/clinics/[clinicId]/dashboard/page.tsx
    - app/(app)/clinics/[clinicId]/pacientes/page.tsx
    - app/(app)/layout.tsx
  referenced:
    - hooks/use-auth.ts
    - lib/error-handling.ts
    - lib/types.ts
    - app/api/appointments/route.ts
    - app/api/patients/route.ts
decisions:
  - "Added Sonner Toaster to app layout (Rule 2 deviation) — required for toast.error() notifications to render visually"
  - "Related patient data (appointments, vitals, medical history) uses empty arrays — no bulk endpoints exist yet; future plan will add per-patient data endpoints"
  - "Appointment counts in list views show 0 — no bulk count endpoint available; deferred to future optimization plan"
metrics:
  duration: ~10 minutes
  completed: "2026-03-30"
  tasks_completed: 4
  files_modified: 6
---

# Phase 04 Plan 03: Frontend Integration - Patients & Dashboard Summary

**One-liner:** Connected 5 page components to real Supabase data via /api/* endpoints, replacing mock data imports with useEffect+fetch patterns including loading states, error handling, and clinic context verification.

## What Was Built

Six files modified to connect existing UI to real API endpoints. All pages now fetch data from `/api/appointments` and `/api/patients` endpoints instead of importing from `lib/mock-data.ts`.

### Dashboard (`app/(app)/dashboard/page.tsx`)
- Replaced `getTodayAppointments()` and `patients` mock imports with `fetch('/api/appointments')` and `fetch('/api/patients')`
- Added `useState`/`useEffect` for appointments, patientsCount, loading, error states
- Added loading skeleton (3 pulsing placeholder cards) while fetching
- Added error banner with formatted error message display
- Uses `useAuth()` to verify clinic context before fetching
- Notifications and WhatsApp conversations still use mock data (no API endpoints yet)

### Patient List (`app/(app)/pacientes/page.tsx`)
- Replaced `patients` mock import and `getPatientAppointments()` with `fetch('/api/patients')`
- Added `useState`/`useEffect` for patients, loading states
- Added loading skeleton (5 pulsing patient rows) while fetching
- Search/filter works on real fetched data
- Uses `useAuth()` for clinic context verification
- Appointment counts show 0 (pending bulk count endpoint)

### Patient Detail (`app/(app)/pacientes/[id]/page.tsx`)
- Replaced `getPatientById()` and 6 related mock functions with `fetch('/api/patients/[id]')`
- Added loading skeleton (avatar + 3 info cards) while fetching
- Added error state with back-to-patients navigation
- **Clinic isolation verified**: redirects if `patient.clinicId !== user.clinic_id` (FE-06)
- Related data (appointments, vitals, consultation notes, vaccines, attachments, medical history) uses empty typed arrays pending dedicated endpoints

### Clinic Dashboard (`app/(app)/clinics/[clinicId]/dashboard/page.tsx`)
- Replaced `getClinicTodayAppointments()` with `fetch('/api/appointments')`
- Added `useState`/`useEffect` for appointments, loading states
- Added loading skeleton while fetching
- Added optional chaining on `appointment.paciente` (paciente is optional in Appointment type)

### Clinic Patients (`app/(app)/clinics/[clinicId]/pacientes/page.tsx`)
- Replaced `getClinicPatients()` and `getPatientAppointments()` with `fetch('/api/patients')`
- Added `useState`/`useEffect` for patients, loading states
- Added loading skeleton while fetching
- Appointment counts show 0 (pending bulk count endpoint)

### App Layout (`app/(app)/layout.tsx`)
- Added `<Toaster />` from `@/components/ui/sonner` — required for toast notifications to render (Rule 2 deviation)

## Data Flow Pattern

All pages follow a consistent pattern:
```
useAuth() → check clinic_id
  → useEffect with [clinic_id] dependency
    → fetch('/api/...') → parse JSON → setState
    → catch → formatErrorMessage() → toast.error()
  → loading ? <Skeleton /> : <RealData />
```

## Deviations from Plan

### Rule 2 - Auto-add missing critical functionality

**Added Sonner Toaster to app layout**
- **Found during:** Task 1 (Dashboard)
- **Issue:** No `<Toaster />` component was mounted in any layout, so `toast.error()` calls would silently fail (no visual notification)
- **Fix:** Added `import { Toaster } from "@/components/ui/sonner"` and `<Toaster />` to `app/(app)/layout.tsx`
- **Files modified:** `app/(app)/layout.tsx`
- **Commit:** `23f2b5a`

## Known Stubs

1. **Patient detail page - related medical data**
   - **File:** `app/(app)/pacientes/[id]/page.tsx`
   - **Reason:** No API endpoints exist yet for patient-specific data (appointments, vital signs, consultation notes, vaccines, attachments, medical history). Empty typed arrays used as placeholders.
   - **Resolution:** Future plan will add `/api/patients/[id]/appointments`, `/api/patients/[id]/vitals`, etc.

2. **Appointment counts in patient list views**
   - **Files:** `app/(app)/pacientes/page.tsx`, `app/(app)/clinics/[clinicId]/pacientes/page.tsx`
   - **Reason:** No bulk count endpoint exists. Showing 0 for all patients.
   - **Resolution:** Could add count to patient API response or create a separate count endpoint.

3. **Notifications and WhatsApp conversations**
   - **File:** `app/(app)/dashboard/page.tsx`
   - **Reason:** No API endpoints exist for notifications or WhatsApp conversations yet.
   - **Resolution:** Will be addressed when those features get API endpoints.

## Self-Check: PASSED

- ✅ `app/(app)/dashboard/page.tsx` fetches from `/api/appointments` with loading/error states
- ✅ `app/(app)/pacientes/page.tsx` fetches from `/api/patients` with loading state
- ✅ `app/(app)/pacientes/[id]/page.tsx` fetches from `/api/patients/[id]` with clinic verification
- ✅ `app/(app)/clinics/[clinicId]/dashboard/page.tsx` fetches from `/api/appointments`
- ✅ `app/(app)/clinics/[clinicId]/pacientes/page.tsx` fetches from `/api/patients`
- ✅ `app/(app)/layout.tsx` includes `<Toaster />` for toast notifications
- ✅ All pages use `useAuth()` for clinic context
- ✅ All pages have loading states (skeleton UI)
- ✅ All API pages have error handling with `formatErrorMessage()` and `toast.error()`
- ✅ Patient detail page verifies clinic isolation (FE-06)
- ✅ All 4 tasks committed atomically

## Commits

| Hash | Message |
|------|---------|
| `23f2b5a` | `feat(04-api-service-integration-03): update dashboard to load real appointments from API` |
| `7ad3789` | `feat(04-api-service-integration-03): update patient list to load real patients from API` |
| `24fdadd` | `feat(04-api-service-integration-03): update patient detail to load real data from API` |
| `478abf5` | `feat(04-api-service-integration-03): update clinic dashboard to load real appointments from API` |
| `547566f` | `feat(04-api-service-integration-03): update clinic patients page to load real data from API` |
