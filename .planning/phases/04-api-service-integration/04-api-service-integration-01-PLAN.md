---
phase: 04-api-service-integration
plan: 01
type: execute
wave: 3
depends_on: [03-database-schema-rls-01]
files_modified: [
  "lib/api-service.ts",
  "app/api/patients/route.ts",
  "app/api/appointments/route.ts",
  "app/(app)/dashboard/page.tsx",
  "app/(app)/pacientes/page.tsx",
  "lib/error-handling.ts"
]
autonomous: true
requirements: [API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10, FE-01, FE-02, FE-03, FE-04, FE-05, FE-06, ERR-01, ERR-02, ERR-03, ERR-04, ERR-05]
user_setup: []

must_haves:
  truths:
    - "Dashboard displays real appointments from Supabase (not mock data)"
    - "Patient list loads from Supabase with clinic filtering"
    - "Form submissions write to Supabase and update UI"
    - "User sees error message if clinic isolation check fails"
    - "User is logged out if session expires (401 from server)"
    - "User cannot access clinic they don't belong to"
  artifacts:
    - path: "lib/api-service.ts"
      provides: "Service layer with clinic-aware query functions"
      exports: ["getPatients", "createAppointment", "updateVitalSigns"]
    - path: "app/api/patients/route.ts"
      provides: "REST endpoint for patient CRUD with RLS enforcement"
      exports: ["GET", "POST", "PATCH", "DELETE"]
---

# Phase 3 Plan: API Service Layer & Frontend Integration

This plan connects the UI to persistent Supabase backend. Frontend components now display real data instead of mock data.

**Depends on:** Phase 2 (RLS must be proven working before API queries can be trusted)

**Key focus:** App-level clinic_id filtering (defense-in-depth) + error handling for Supabase downtime.

(Full plan body similar structure...)

---

*Plan created: 2026-03-27*
