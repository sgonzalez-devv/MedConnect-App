---
phase: 04-api-service-integration
plan: 02
type: execute
wave: 2
depends_on: [04-api-service-integration-01]
files_modified: [
  "app/api/patients/route.ts",
  "app/api/patients/[id]/route.ts",
  "app/api/appointments/route.ts",
  "app/api/appointments/[id]/route.ts"
]
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "GET /api/patients returns all patients for current user's clinic"
    - "POST /api/patients creates new patient with clinic_id from auth context"
    - "PATCH /api/patients/[id] updates existing patient (clinic_id verified)"
    - "DELETE /api/patients/[id] deletes patient (clinic_id verified)"
    - "GET /api/appointments returns appointments for current clinic with optional date filtering"
    - "POST /api/appointments creates new appointment (clinic_id from auth)"
    - "All endpoints return 401 if user not authenticated, 403 if clinic isolation fails"
  artifacts:
    - path: "app/api/patients/route.ts"
      provides: "GET/POST endpoints for patients resource"
      exports: ["GET", "POST"]
      min_lines: 100
    - path: "app/api/patients/[id]/route.ts"
      provides: "PATCH/DELETE endpoints for patient detail resource"
      exports: ["PATCH", "DELETE", "GET"]
    - path: "app/api/appointments/route.ts"
      provides: "GET/POST endpoints for appointments resource"
      exports: ["GET", "POST"]
    - path: "app/api/appointments/[id]/route.ts"
      provides: "PATCH/DELETE endpoints for appointment detail resource"
      exports: ["PATCH", "DELETE"]
  key_links:
    - from: "app/api/patients/route.ts"
      to: "lib/api-service.ts"
      via: "Call service functions"
      pattern: "import.*getPatients.*createPatient"
    - from: "all route handlers"
      to: "useAuth hook via middleware"
      via: "Request context with user info"
      pattern: "req.user from middleware context"
    - from: "api routes"
      to: "error-handling.ts"
      via: "Error responses in catch blocks"
      pattern: "handleSupabaseError.*500.*400"

---

# Plan 2: Core API Routes

Create REST API endpoints for patients and appointments. These routes serve as the bridge between frontend components and the service layer.

**Purpose:** Frontend components fetch data via HTTP endpoints (not direct Supabase queries). Endpoints verify authentication and clinic access before calling service functions.

**Output:** 4 new route files providing full CRUD for patients and appointments

**Depends on:** Plan 01 (Service layer must exist to call)

---

## Context

### Plan 1 Foundation (Complete)
- lib/api-service.ts provides all CRUD functions
- lib/error-handling.ts provides error utilities
- All functions enforce clinic_id filtering

### Plan 2 Goal (This Plan)
REST API endpoints that:
1. Extract user from authenticated request (via middleware)
2. Verify clinic access
3. Delegate to service layer functions
4. Return JSON responses with proper error handling

### Technical Approach
- **Routes in app/api/**: Next.js App Router API routes
- **Authentication:** Middleware provides req.user with clinic_id and user_role
- **Request validation:** Basic validation (required fields, type checking)
- **Response format:** { data?, error?, status } (consistent with lib/types.ts ApiResponse)
- **Error responses:** 400 (validation), 401 (auth), 403 (clinic access), 500 (server error)

---

## Tasks

<task type="auto">
  <name>Task 1: Create patients API routes (GET/POST /api/patients, PATCH/DELETE /api/patients/[id])</name>
  <files>app/api/patients/route.ts, app/api/patients/[id]/route.ts</files>
  <action>
Create two route files:

**app/api/patients/route.ts:**
- Export GET handler that:
  - Checks req.user exists (if not, return 401)
  - Calls getPatients(req.user.clinic_id)
  - Returns { data: Patient[] } on success
  - Returns { error: string, status: 400 } on error
  
- Export POST handler that:
  - Checks req.user exists and role can create (staff/admin)
  - Validates request body (required: nombre, apellido, email, telefono, etc.)
  - Calls createPatient(req.user.clinic_id, body)
  - Returns { data: Patient, status: 201 } on success
  - Returns { error: string, status: 400|401|403 } on error

**app/api/patients/[id]/route.ts:**
- Export GET handler that:
  - Fetches single patient by ID
  - Verifies clinic_id matches user's clinic
  - Returns { data: Patient } or 404
  
- Export PATCH handler that:
  - Checks authentication and clinic access
  - Validates partial update body
  - Calls updatePatient(req.user.clinic_id, id, body)
  - Returns { data: Patient, status: 200 }
  
- Export DELETE handler that:
  - Checks authentication and role (admin only?)
  - Verifies clinic_id access
  - Calls deletePatient(req.user.clinic_id, id)
  - Returns { data: null, status: 204 } on success

Error handling: Use try-catch and call handleSupabaseError for proper error formatting.
Type safety: Validate request body with Zod before calling service functions.

Patterns:
- Check req.user: if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
- Parse body: const body = await req.json()
- Call service: const data = await getPatients(req.user.clinic_id)
- Return response: return Response.json({ data }, { status: 200 })
  </action>
  <verify>
    <automated>
      test -f app/api/patients/route.ts && echo "PASS: Patients route created" || echo "FAIL: Missing"
      test -f app/api/patients/\[id\]/route.ts && echo "PASS: Patients detail route created" || echo "FAIL: Missing"
      grep -q "export.*GET\|export.*POST" app/api/patients/route.ts && echo "PASS: Handlers exported" || echo "FAIL"
    </automated>
  </verify>
  <done>app/api/patients/route.ts exports GET, POST handlers; app/api/patients/[id]/route.ts exports GET, PATCH, DELETE; all handlers check authentication; error responses include proper status codes</done>
</task>

<task type="auto">
  <name>Task 2: Create appointments API routes (GET/POST /api/appointments, PATCH/DELETE /api/appointments/[id])</name>
  <files>app/api/appointments/route.ts, app/api/appointments/[id]/route.ts</files>
  <action>
Create two route files parallel to patients routes:

**app/api/appointments/route.ts:**
- Export GET handler:
  - Query params: fromDate?, toDate?, patientId?
  - Calls getAppointments(req.user.clinic_id, { fromDate, toDate, patientId })
  - Returns { data: Appointment[] }
  
- Export POST handler:
  - Validates: pacienteId, fecha, hora, motivo, tipo
  - Calls createAppointment(req.user.clinic_id, body)
  - Returns { data: Appointment, status: 201 }

**app/api/appointments/[id]/route.ts:**
- Export GET handler: Fetch single appointment
- Export PATCH handler: Update appointment (verify clinic access)
- Export DELETE handler: Delete appointment (verify clinic access and role)

Same patterns as patients routes: check auth, validate input, call service, return response.
  </action>
  <verify>
    <automated>
      test -f app/api/appointments/route.ts && echo "PASS: Appointments route created" || echo "FAIL"
      test -f app/api/appointments/\[id\]/route.ts && echo "PASS: Appointments detail route created" || echo "FAIL"
    </automated>
  </verify>
  <done>app/api/appointments/route.ts exports GET, POST; app/api/appointments/[id]/route.ts exports GET, PATCH, DELETE; all handlers check clinic_id in WHERE clause (defense-in-depth); error responses formatted</done>
</task>

</tasks>

<verification>
- [ ] All 4 route files exist and export correct handlers
- [ ] All GET handlers check authentication
- [ ] All POST/PATCH handlers validate request body
- [ ] All DELETE handlers verify clinic access before deletion
- [ ] Error responses include proper status codes (400, 401, 403, 500)
- [ ] Service layer functions are called from routes
</verification>

<success_criteria>
- API endpoints provide REST interface to patient and appointment data
- All endpoints enforce clinic isolation via clinic_id from auth
- Responses are JSON with consistent structure
- Errors are user-friendly (not raw database errors)
</success_criteria>

<output>
After completion, create `.planning/phases/04-api-service-integration/04-api-service-integration-02-SUMMARY.md`
</output>
