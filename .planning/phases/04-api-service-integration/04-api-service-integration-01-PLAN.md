---
phase: 04-api-service-integration
plan: 01
type: execute
wave: 1
depends_on: [03-database-schema-rls-04]
files_modified: [
  "lib/api-service.ts",
  "lib/error-handling.ts",
  "lib/types.ts"
]
autonomous: true
requirements: [API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10, ERR-01, ERR-02, ERR-03, ERR-04, ERR-05]
user_setup: []

must_haves:
  truths:
    - "Service layer provides clinic-aware functions for fetching patients, appointments, vital signs"
    - "CRUD functions include clinic_id in all queries automatically (defense-in-depth)"
    - "Service functions return proper TypeScript types matching lib/types.ts"
    - "Error messages are user-friendly (not raw database errors)"
    - "Session expiration (401) is detected and handled gracefully"
    - "Clinic isolation failures are reported with clear error messages"
  artifacts:
    - path: "lib/api-service.ts"
      provides: "Service layer with clinic-aware CRUD functions"
      exports: ["getPatients", "getAppointments", "getVitalSigns", "createPatient", "updateAppointment", "deleteAppointment", "handleApiError"]
      min_lines: 300
    - path: "lib/error-handling.ts"
      provides: "Error handling utilities for Supabase errors"
      exports: ["handleSupabaseError", "isAuthError", "isClinicIsolationError", "formatErrorMessage"]
      min_lines: 100
  key_links:
    - from: "lib/api-service.ts"
      to: "lib/supabase.ts"
      via: "Supabase client with clinic_id filtering"
      pattern: "const { data, error } = await supabase.*clinic_id.*eq"
    - from: "api-service.ts"
      to: "lib/error-handling.ts"
      via: "Error handler on every query"
      pattern: "if \\(error\\) handleSupabaseError\\(error\\)"
    - from: "frontend pages"
      to: "api-service.ts"
      via: "Import and call service functions"
      pattern: "import.*getPatients.*from.*api-service"

---

# Plan 1: API Service Layer & Error Handling

Create clinic-aware service layer functions that wrap Supabase queries with automatic clinic_id filtering (defense-in-depth) and comprehensive error handling. This plan establishes the bridge between frontend and database.

**Purpose:** Frontend pages should NOT directly query Supabase. Instead, they import service functions that handle clinic isolation, error handling, and type transformation automatically.

**Output:** Two new files providing all CRUD patterns and error utilities; updated types for any additional API-specific interfaces.

**Depends on:** Phase 3 (Database schema and RLS policies must be proven working)

---

## Context

### Phase 2 Foundation (Complete)
- Supabase Auth with JWT clinic_id claims
- useAuth hook provides current user context
- Session middleware validates every request

### Phase 3 Foundation (Complete)
- All 10 core tables exist with clinic_id columns
- RLS policies enforce clinic boundaries at database layer
- Integration tests verify role-based access works

### Phase 4 Goal (This Plan)
API service layer provides clinic-aware functions. Every function:
1. Automatically includes clinic_id in all queries
2. Handles Supabase errors gracefully
3. Returns properly typed results
4. Detects auth failures (401) and session expiration

### Technical Approach
- **Client isolation:** Service functions always filter by current user's clinic_id from useAuth hook
- **Server isolation:** RLS policies provide backup enforcement (should never be reached if app layer works)
- **Error categories:** Auth errors (401), clinic isolation errors (403 from RLS), data errors (4xx), connection errors (5xx)
- **User messaging:** Never expose database error details; translate to user-friendly messages

---

## Tasks

<task type="auto">
  <name>Task 1: Create error handling utilities (lib/error-handling.ts)</name>
  <files>lib/error-handling.ts</files>
  <action>
Create error handling module with functions to:
- Detect error types: Auth (401), Clinic isolation (RLS violation), Data validation, Connection errors
- Map Supabase error codes to error categories
- Format error messages for user display (never expose raw DB errors)
- Provide error logging patterns for debugging

Export functions:
- `isAuthError(error): boolean` - Detects 401 or expired session
- `isClinicIsolationError(error): boolean` - Detects RLS policy violations
- `isValidationError(error): boolean` - Detects data validation errors
- `formatErrorMessage(error, context): string` - Converts error to user-friendly message
- `handleSupabaseError(error, context)` - Logs and categorizes error, returns formatted message

Behavior examples:
- Input: Supabase error "new row violates check constraint 'clinic_id_required'"
- Output: isValidationError = true, formatErrorMessage = "Missing required information"
- Input: Supabase error "new row violates row level security policy"
- Output: isClinicIsolationError = true, formatErrorMessage = "You don't have permission to access this resource"
- Input: Supabase error "JWT expired"
- Output: isAuthError = true, formatErrorMessage = "Your session has expired. Please log in again."

Use Zod for type-safe error response structure (e.g., ErrorResponse interface).
  </action>
  <verify>
    <automated>
      grep -q "isAuthError\|isClinicIsolationError\|formatErrorMessage" lib/error-handling.ts && echo "PASS: Functions exported" || echo "FAIL: Missing functions"
      grep -q "export.*function\|export const" lib/error-handling.ts && wc -l lib/error-handling.ts | grep -E "[1-9][0-9]{2,}
    </automated>
  </verify>
  <done>lib/error-handling.ts exists with all 5 exported functions; each function has JSDoc explaining behavior; test patterns in comments show expected inputs/outputs</done>
</task>

<task type="auto">
  <name>Task 2: Create API service layer (lib/api-service.ts)</name>
  <files>lib/api-service.ts</files>
  <action>
Create service layer module that provides clinic-aware CRUD functions. Every function:
1. Takes clinic_id as first parameter (or derives from useAuth context if client-side)
2. Filters all queries by clinic_id automatically (defense-in-depth with RLS)
3. Calls error handler on any error
4. Returns properly typed results (using lib/types.ts)
5. Includes JSDoc with requirement ID

For getters (READ):
- `getPatients(clinicId: string, options?: {limit?: number, offset?: number}): Promise<Patient[]>`
  - Implements API-01 (fetch patients, clinic-aware)
  - Query: SELECT * FROM patients WHERE clinic_id = $1 ORDER BY nombre ASC
  
- `getAppointments(clinicId: string, options?: {fromDate?: string, toDate?: string}): Promise<Appointment[]>`
  - Implements API-02 (fetch appointments, clinic-aware)
  - Query: SELECT * FROM appointments WHERE clinic_id = $1 AND fecha BETWEEN $2 AND $3
  
- `getVitalSigns(clinicId: string, patientId: string): Promise<VitalSigns[]>`
  - Implements API-04 (fetch vital signs per patient)
  - Query: SELECT * FROM vital_signs WHERE clinic_id = $1 AND paciente_id = $2 ORDER BY fecha DESC
  
- `getConsultationNotes(clinicId: string, patientId?: string): Promise<ConsultationNote[]>`
  - Implements API-03 (fetch consultation notes)
  - Query: SELECT * FROM consultation_notes WHERE clinic_id = $1 [AND paciente_id = $2]
  
- `getAttachments(clinicId: string, patientId?: string): Promise<MedicalAttachment[]>`
  - Implements API-05 (fetch medical attachments)
  
- `getDoctorProfiles(clinicId: string): Promise<DoctorProfile[]>`
  - Implements API-06 (fetch doctor profiles)

For creators (CREATE):
- `createPatient(clinicId: string, data: Omit<Patient, 'id' | 'clinicId'>): Promise<Patient>`
  - Implements API-07 (create new patient)
  - Automatically adds clinic_id to INSERT
  
- `createAppointment(clinicId: string, data: Omit<Appointment, 'id' | 'clinicId'>): Promise<Appointment>`
  - Implements API-07 (create new appointment)

For updaters (UPDATE):
- `updateAppointment(clinicId: string, appointmentId: string, data: Partial<Appointment>): Promise<Appointment>`
  - Implements API-08 (update appointment)
  - Verify clinic_id in WHERE clause to prevent cross-clinic updates
  
- `updateVitalSigns(clinicId: string, vitalSignsId: string, data: Partial<VitalSigns>): Promise<VitalSigns>`
  - Implements API-08 (update vital signs)

For deleters (DELETE):
- `deleteAppointment(clinicId: string, appointmentId: string): Promise<void>`
  - Implements API-09 (delete appointment)
  - Verify clinic_id in WHERE clause
  
- `deletePatient(clinicId: string, patientId: string): Promise<void>`
  - Implements API-09 (delete patient, cascade deletions)

For clinic enforcement:
- `verifyClinicAccess(clinicId: string, userId: string): Promise<boolean>`
  - Implements API-10 (enforce clinic context)
  - Check: Is user assigned to this clinic_id?
  - Return: true if user has access, false otherwise

Error handling: Every function wraps try-catch and calls handleSupabaseError from lib/error-handling.ts. If error occurs, throw with formatted message.

Type safety: Use lib/types.ts Patient, Appointment, VitalSigns, etc. All functions return Promise<T> with proper typing.

Requirement traceability: Each function has @requirement JSDoc comment (e.g., @requirement API-01, API-07) for traceability.
  </action>
  <verify>
    <automated>
      grep -c "export.*function\|export const" lib/api-service.ts | grep -E "[0-9]{2,}
      grep -q "API-0[1-9]" lib/api-service.ts && echo "PASS: Requirements tagged" || echo "FAIL: No requirement tags"
      grep -q "clinic_id" lib/api-service.ts && echo "PASS: Clinic filtering present" || echo "FAIL: Missing clinic_id checks"
    </automated>
  </verify>
  <done>lib/api-service.ts exists with 13+ exported functions; every function includes clinic_id in query; all requirements API-01 to API-10, ERR-01 to ERR-05 have traceability comments; error handling integrated</done>
</task>

<task type="auto">
  <name>Task 3: Update lib/types.ts with API response types (if needed)</name>
  <files>lib/types.ts</files>
  <action>
Review lib/types.ts and add any API-specific types not yet present:
- ApiResponse<T> interface with { data?: T, error?: string, status: number }
- ApiError interface with { code: string, message: string, details?: unknown }
- CreatePatientRequest, UpdateAppointmentRequest (for form submissions)
- Pagination metadata type if needed for large result sets

Only add if not already present. If types are complete, this task can be combined with Task 2 (no modifications needed).
  </action>
  <verify>
    <automated>
      grep -q "ApiResponse\|ApiError" lib/types.ts && echo "PASS: API types exist" || echo "OK: May not be needed yet"
    </automated>
  </verify>
  <done>lib/types.ts has API-specific types or is verified as complete; no breaking changes to existing type definitions</done>
</task>

</tasks>

<verification>
- [ ] lib/error-handling.ts exports 5+ error handling functions
- [ ] lib/api-service.ts exports 13+ service functions covering all CRUD operations
- [ ] Every query in api-service.ts includes clinic_id filter
- [ ] Every function has @requirement comment linking to API-01 through API-10
- [ ] Error handling is integrated (try-catch with handleSupabaseError calls)
- [ ] Types match lib/types.ts definitions
- [ ] No raw database errors exposed to users (all errors formatted)
</verification>

<success_criteria>
- Service layer provides clinic-aware CRUD functions that can be imported by pages
- Error handling covers auth, clinic isolation, validation, and connection errors
- All functions return properly typed promises
- Requirement IDs API-01 through API-10 and ERR-01 through ERR-05 are traceable in code
</success_criteria>

<output>
After completion, create `.planning/phases/04-api-service-integration/04-api-service-integration-01-SUMMARY.md`
</output>
