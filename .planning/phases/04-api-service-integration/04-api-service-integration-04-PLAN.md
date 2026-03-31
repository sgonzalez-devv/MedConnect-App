---
phase: 04-api-service-integration
plan: 04
type: execute
wave: 3
depends_on: [04-api-service-integration-02]
files_modified: [
  "app/(app)/calendario/page.tsx",
  "app/(app)/calendario/nueva-cita/page.tsx",
  "app/(app)/pacientes/nuevo/page.tsx",
  "app/(app)/clinics/[clinicId]/calendario/page.tsx",
  "app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx",
  "app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx"
]
autonomous: false
requirements: [FE-03, FE-05, ERR-01]
user_setup: []

must_haves:
  truths:
    - "Appointment calendar fetches from /api/appointments (not mock data)"
    - "New appointment form submission writes to /api/appointments"
    - "New patient form submission writes to /api/patients"
    - "Form submissions show loading state while sending"
    - "Server validation errors are displayed to user"
    - "Session expiration (401) logs user out and redirects to login"
    - "Clinic isolation check failure (403) shows error and prevents submission"
  artifacts:
    - path: "app/(app)/calendario/page.tsx"
      provides: "Calendar view with real appointments"
      pattern: "fetch.*api/appointments\|useEffect"
    - path: "app/(app)/calendario/nueva-cita/page.tsx"
      provides: "New appointment form with submission to /api/appointments"
      pattern: "fetch.*POST.*api/appointments\|onSubmit"
    - path: "app/(app)/pacientes/nuevo/page.tsx"
      provides: "New patient form with submission to /api/patients"
      pattern: "fetch.*POST.*api/patients\|onSubmit"
    - path: "app/(app)/clinics/[clinicId]/*"
      provides: "Clinic-specific appointment and patient forms"
      pattern: "fetch.*clinic_id"
  key_links:
    - from: "form onSubmit handlers"
      to: "/api/patients and /api/appointments"
      via: "fetch(POST) with FormData or JSON body"
      pattern: "fetch.*POST.*Content-Type"
    - from: "form pages"
      to: "error display"
      via: "Show toast on 400/403/500 errors"
      pattern: "toast\\.error\|handleSupabaseError"
    - from: "form submission"
      to: "clinic verification"
      via: "clinic_id in request body and auth context"
      pattern: "clinic_id.*form.*auth"

---

# Plan 4: Frontend Integration - Appointment & Patient Forms

Connect appointment calendar and form pages to real Supabase API. Users can create and edit appointments and patients; form submissions write to database.

**Purpose:** Forms are no longer decorative. Users submit forms and see data persisted in Supabase.

**Output:** Updated 6 page components with form submission handling

**Depends on:** Plan 02 (POST /api/appointments and POST /api/patients routes must exist)

**Has checkpoint:** Human verification of form workflows

---

## Context

### Prior Phases (Complete)
- Phase 2: Authentication
- Phase 3: Database with RLS
- Plans 1-3: Service layer, API routes, list pages with real data

### Plan 4 Goal (This Plan)
Forms submit real data to API endpoints:
1. Calendar loads real appointments (like dashboard in Plan 3)
2. New appointment form submits to POST /api/appointments
3. New patient form submits to POST /api/patients
4. Forms show loading state, validation errors, and success feedback
5. Session expiration and clinic isolation errors handled gracefully

### Technical Approach
- **Form state:** React Hook Form + Zod (existing setup)
- **Submission:** fetch(POST) with JSON body
- **Clinic context:** Automatically injected from useAuth() hook
- **Error display:** Toast notifications for validation/auth/clinic errors
- **Success:** Redirect to list page or show success toast
- **Validation:** Client-side (Zod) before submission, server-side in API routes

### Gotchas to Avoid
- Don't forget clinic_id in form submission (should come from auth, not user input)
- Don't show raw API errors to users
- Don't redirect before user sees success confirmation
- Don't allow form submission if not authenticated

---

## Tasks

<task type="auto">
  <name>Task 1: Update appointment calendar to load real data and enable new appointment form</name>
  <files>app/(app)/calendario/page.tsx, app/(app)/calendario/nueva-cita/page.tsx</files>
  <action>
Update calendar page and new appointment form:

**Calendar page (app/(app)/calendario/page.tsx):**
1. Remove mock appointment data imports
2. Add useEffect to fetch /api/appointments
3. Add state: [appointments, setAppointments] = useState<Appointment[]>([])
4. Display appointments in calendar using existing components
5. Add "New Appointment" button linking to nueva-cita page

**New appointment form (app/(app)/calendario/nueva-cita/page.tsx):**
1. Keep existing React Hook Form + Zod setup
2. Update onSubmit to:
   - Validate form with Zod schema (client-side)
   - Call fetch('/api/appointments', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         ...formData,
         clinic_id: useAuth().clinic_id  // Add from auth context
       })
     })
   - Show loading state while submitting (disable submit button, show spinner)
   - On success (200/201): Show toast.success("Appointment created") and redirect to /calendario
   - On error: Show toast.error(formatErrorMessage(error))
   - On 401: Log out user and redirect to /auth/login with message "Session expired"
   - On 403: Show toast.error("You don't have permission to create this appointment")
3. Add required form fields: pacienteId, fecha, hora, tipo, motivo
4. Add optional fields: notas, duracion
5. Validate appointment date is in future (no past appointments)
6. Prevent form submission if not authenticated (check useAuth().user)

Patterns:
- useEffect to load patients for dropdown: fetch('/api/patients') in separate effect
- Form submission: const onSubmit = async (data) => { const response = await fetch(...); ... }
- Error handling: if (!response.ok) { const error = await response.json(); toast.error(...) }
- Redirect: router.push('/calendario')
  </action>
  <verify>
    <automated>
      grep -q "fetch.*POST.*api/appointments\|onSubmit" app/\(app\)/calendario/nueva-cita/page.tsx && echo "PASS: Form submission" || echo "FAIL"
      grep -q "loading\|isSubmitting" app/\(app\)/calendario/nueva-cita/page.tsx && echo "PASS: Loading state" || echo "FAIL"
    </automated>
  </verify>
  <done>Calendar loads real appointments; new appointment form submits to API; loading state shown; errors displayed; success redirect works</done>
</task>

<task type="auto">
  <name>Task 2: Update new patient form to submit to API</name>
  <files>app/(app)/pacientes/nuevo/page.tsx</files>
  <action>
Update new patient form to write to database:

1. Keep existing React Hook Form + Zod setup
2. Update onSubmit to:
   - Validate with Zod schema (client-side)
   - Call fetch('/api/patients', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         ...formData,
         clinic_id: useAuth().clinic_id  // From auth context
       })
     })
   - Show loading state while submitting (disable submit, show spinner)
   - On success (201): Show toast.success("Patient created") and redirect to /pacientes
   - On error: Show toast.error(formatErrorMessage(error))
   - Handle 401, 403 same as appointment form
3. Add required fields: nombre, apellido, email, telefono, fechaNacimiento, genero, direccion
4. Add optional fields: alergias[], condicionesCronicas[], grupoSanguineo, avatar
5. Validate: email format, phone format, birth date in past
6. Show "Back" button to cancel and return to patient list

Patterns: Same as appointment form (fetch POST, loading state, error handling, redirect on success)
  </action>
  <verify>
    <automated>
      grep -q "fetch.*POST.*api/patients\|onSubmit" app/\(app\)/pacientes/nuevo/page.tsx && echo "PASS" || echo "FAIL"
      grep -q "loading\|isSubmitting" app/\(app\)/pacientes/nuevo/page.tsx && echo "PASS" || echo "FAIL"
    </automated>
  </verify>
  <done>New patient form submits to /api/patients; loading state shown; errors displayed; validation works; success redirect works</done>
</task>

<task type="auto">
  <name>Task 3: Update clinic-specific appointment and patient forms</name>
  <files>app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx, app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx, app/(app)/clinics/[clinicId]/calendario/page.tsx</files>
  <action>
Update multi-clinic forms with clinic-specific submission:

For both new appointment and new patient forms in clinic-specific paths:
1. Extract clinicId from route params
2. Verify user has access to this clinic (check useAuth().clinic_id === clinicId)
3. If not authorized, show error and redirect to /clinics
4. Form submission: add clinic_id to request body (use clinicId from params, not auth)
5. After success, redirect to clinic-specific list (/clinics/[clinicId]/calendario or /clinics/[clinicId]/pacientes)

Same error handling, loading states, validation as Tasks 1-2.

Reuse code patterns but add clinic_id param validation.
  </action>
  <verify>
    <automated>
      grep -q "clinicId.*params\|clinic_id" app/\(app\)/clinics/\[clinicId\]/calendario/nueva-cita/page.tsx && echo "PASS" || echo "FAIL"
      grep -q "clinicId.*params\|clinic_id" app/\(app\)/clinics/\[clinicId\]/pacientes/nuevo/page.tsx && echo "PASS" || echo "FAIL"
    </automated>
  </verify>
  <done>Clinic-specific forms verify clinic access; clinic_id included in submissions; redirects to clinic-specific lists</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Form workflows: New patient creation, new appointment creation. Calendar with real appointments. Session expiration handling.
  </what-built>
  <how-to-verify>
1. Go to /pacientes/nuevo and create a new patient
   - Expected: Form submits, shows loading state, redirects to /pacientes
   - Verify in database: New patient appears in list with correct clinic_id

2. Go to /calendario/nueva-cita and create a new appointment
   - Expected: Form submits, shows loading state, appointment appears in calendar
   - Verify in database: New appointment has correct clinic_id and paciente_id

3. Test session expiration:
   - Logout and use browser dev tools to manually set expired session cookie
   - Try to create a new patient/appointment
   - Expected: API returns 401, user is logged out, redirected to /auth/login with message

4. Test clinic isolation:
   - (If multi-clinic setup exists) Try to submit form with different clinic_id
   - Expected: API returns 403, toast shows error, form stays open for retry

5. Test validation errors:
   - Submit form with invalid data (empty required fields, bad email)
   - Expected: Client validation shows error messages

6. Test clinic context (FE-06):
   - Verify current clinic is always shown in header/form
   - Try accessing another clinic's form (if exists)
   - Expected: Redirect or error if not authorized
  </how-to-verify>
  <resume-signal>
Describe any issues found, or type "approved" to proceed.
Example issues:
- "Form doesn't submit, console shows XHR error"
- "Session expiration doesn't log out user"
- "Clinic isolation not enforced in form submission"
  </resume-signal>
</task>

</tasks>

<verification>
- [ ] Calendar page loads real appointments
- [ ] New appointment form submits to /api/appointments
- [ ] New patient form submits to /api/patients
- [ ] Forms show loading state while submitting
- [ ] Validation errors displayed to user
- [ ] Session expiration (401) logs user out
- [ ] Clinic isolation failure (403) shows error
- [ ] Success redirects user to list page
- [ ] Clinic-specific forms include clinic_id verification
- [ ] All error messages are user-friendly (no raw API errors)
</verification>

<success_criteria>
- Appointment calendar displays real data from Supabase (FE-03)
- Form submissions write data to Supabase (FE-05)
- Clinic isolation enforced in form submissions (FE-06, ERR-02)
- Session expiration handled gracefully (ERR-03)
- All error messages user-friendly (ERR-01)
</success_criteria>

<output>
After completion, create `.planning/phases/04-api-service-integration/04-api-service-integration-04-SUMMARY.md`
</output>
