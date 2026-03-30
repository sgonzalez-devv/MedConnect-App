---
phase: 04-api-service-integration
plan: 02
subsystem: api
tags: [api-routes, rest, patients, appointments, clinic-isolation]
dependency_graph:
  requires: [04-api-service-integration-01]
  provides: [api-routes-patients, api-routes-appointments]
  affects: [frontend-integration]
tech_stack:
  added: []
  patterns: [next-app-router-api-routes, clinic-context-helper, defense-in-depth]
key_files:
  created:
    - app/api/patients/route.ts
    - app/api/patients/[id]/route.ts
    - app/api/appointments/route.ts
    - app/api/appointments/[id]/route.ts
  modified: []
  referenced:
    - lib/api-service.ts
    - lib/error-handling.ts
    - lib/types.ts
    - lib/supabase.ts
decisions: []
metrics:
  duration: ~2 minutes
  completed: "2026-03-30"
  tasks_completed: 2
  files_created: 4
---

# Phase 04 Plan 02: Core API Routes Summary

**One-liner:** REST API endpoints for patients and appointments with clinic isolation via authenticated Supabase context.

## What Was Built

Four Next.js App Router API route files providing full CRUD for patients and appointments resources. All endpoints enforce authentication, clinic isolation, and role-based access control.

### Patients API (`app/api/patients/`)

| Endpoint | Handler | Auth | Role Check | Description |
|----------|---------|------|------------|-------------|
| `GET /api/patients` | GET | ✅ | — | List patients for current clinic (paginated) |
| `POST /api/patients` | POST | ✅ | staff/admin | Create patient in current clinic |
| `GET /api/patients/[id]` | GET | ✅ | — | Fetch single patient with clinic verification |
| `PATCH /api/patients/[id]` | PATCH | ✅ | staff/admin | Update patient (immutable fields blocked) |
| `DELETE /api/patients/[id]` | DELETE | ✅ | admin only | Delete patient (pre-verifies existence) |

### Appointments API (`app/api/appointments/`)

| Endpoint | Handler | Auth | Role Check | Description |
|----------|---------|------|------------|-------------|
| `GET /api/appointments` | GET | ✅ | — | List appointments with date/patient filtering |
| `POST /api/appointments` | POST | ✅ | non-patient | Create appointment in current clinic |
| `GET /api/appointments/[id]` | GET | ✅ | — | Fetch single appointment with clinic verification |
| `PATCH /api/appointments/[id]` | PATCH | ✅ | non-patient | Update appointment (immutable fields blocked) |
| `DELETE /api/appointments/[id]` | DELETE | ✅ | non-patient | Delete appointment (pre-verifies existence) |

## Implementation Details

### Authentication Pattern
All handlers use a consistent `getUserClinicContext()` helper that:
1. Creates Supabase client
2. Calls `supabase.auth.getUser()` to verify authentication
3. Calls `supabase.auth.getSession()` to verify session
4. Queries `users` table for `clinic_id` and `user_role`
5. Returns `{ clinic_id, user_role }` or `null`

### Validation
- **Required fields:** Checked before service layer calls
- **Email format:** Regex validation
- **Enum values:** `genero`, `tipo`, `estado` validated against allowed values
- **Date/time format:** YYYY-MM-DD and HH:MM regex patterns
- **Immutable fields:** `id`, `clinicId`, `clinic_id` blocked from updates
- **Pagination:** `limit` and `offset` validated as positive integers

### Error Responses
| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid input, missing fields, bad format |
| 401 | `AUTH_REQUIRED` | No authenticated user |
| 401 | `SESSION_EXPIRED` | Session invalid |
| 403 | `FORBIDDEN` | Role lacks permission |
| 404 | `NOT_FOUND` / `USER_NOT_FOUND` | Resource or user profile missing |
| 500 | `SERVER_ERROR` | Unexpected server error |

### Defense-in-Depth
- App-level: `clinic_id` from user profile used in all service layer calls
- Database-level: RLS policies enforce clinic isolation at PostgreSQL layer
- Route-level: Patient/appointment existence verified before DELETE operations

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- ✅ `app/api/patients/route.ts` exists with GET, POST exports
- ✅ `app/api/patients/[id]/route.ts` exists with GET, PATCH, DELETE exports
- ✅ `app/api/appointments/route.ts` exists with GET, POST exports
- ✅ `app/api/appointments/[id]/route.ts` exists with GET, PATCH, DELETE exports
- ✅ All handlers check authentication (401 on missing auth)
- ✅ All POST/PATCH handlers validate request body
- ✅ All DELETE handlers verify clinic access before deletion
- ✅ Error responses include proper status codes (400, 401, 403, 404, 500)
- ✅ Service layer functions called from routes (getPatients, createPatient, getAppointments, etc.)

## Commits

| Hash | Message |
|------|---------|
| `4b3eb43` | `feat(04-api-service-integration-02): add patients API routes with GET/POST/PATCH/DELETE` |
| `ecf79ce` | `feat(04-api-service-integration-02): add appointments API routes with GET/POST/PATCH/DELETE` |
