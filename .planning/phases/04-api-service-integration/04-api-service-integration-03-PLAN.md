---
phase: 04-api-service-integration
plan: 03
type: execute
wave: 3
depends_on: [04-api-service-integration-02]
files_modified: [
  "app/(app)/dashboard/page.tsx",
  "app/(app)/pacientes/page.tsx",
  "app/(app)/pacientes/[id]/page.tsx",
  "app/(app)/clinics/[clinicId]/dashboard/page.tsx",
  "app/(app)/clinics/[clinicId]/pacientes/page.tsx"
]
autonomous: true
requirements: [FE-01, FE-02, FE-04, FE-06]
user_setup: []

must_haves:
  truths:
    - "Dashboard loads real appointments from /api/appointments (not mock data)"
    - "Patient list loads real patients from /api/patients (not mock data)"
    - "Patient detail page loads real medical history from /api/patients/[id]"
    - "Clinic selector displays current user's clinic context"
    - "All list views include loading state while fetching"
    - "All pages verify clinic context (redirect if user not in clinic)"
  artifacts:
    - path: "app/(app)/dashboard/page.tsx"
      provides: "Dashboard with real appointments from Supabase"
      pattern: "fetch.*api/appointments\|useEffect.*getAppointments"
    - path: "app/(app)/pacientes/page.tsx"
      provides: "Patient list with real data"
      pattern: "fetch.*api/patients\|useState.*patients"
    - path: "app/(app)/pacientes/[id]/page.tsx"
      provides: "Patient detail page with real medical history"
    - path: "app/(app)/clinics/[clinicId]/dashboard/page.tsx"
      provides: "Multi-clinic dashboard with clinic filtering"
    - path: "app/(app)/clinics/[clinicId]/pacientes/page.tsx"
      provides: "Clinic-specific patient list"
  key_links:
    - from: "dashboard/page.tsx"
      to: "/api/appointments"
      via: "fetch in useEffect"
      pattern: "useEffect.*fetch.*api/appointments"
    - from: "pacientes/page.tsx"
      to: "/api/patients"
      via: "fetch in useEffect"
      pattern: "useEffect.*fetch.*api/patients"
    - from: "all pages"
      to: "useAuth hook"
      via: "Get current user's clinic_id"
      pattern: "const.*useAuth.*clinic_id"
    - from: "all pages"
      to: "error display"
      via: "Show error toast if fetch fails"
      pattern: "toast\\.error\|sonner"

---

# Plan 3: Frontend Integration - Patients & Dashboard

Connect existing UI components to real Supabase data. Replace mock data calls with API fetch calls. Add loading states, error handling, and clinic context verification.

**Purpose:** Pages display real data from Supabase instead of hard-coded mock data. Users see their actual appointments and patients.

**Output:** Updated 5 page components with real data integration

**Depends on:** Plan 02 (API endpoints must exist to call)

---

## Context

### Prior Phases (Complete)
- Phase 2: Authentication with clinic_id in JWT
- Phase 3: Database with RLS policies
- Plan 1: Service layer and error handling
- Plan 2: REST API endpoints

### Plan 3 Goal (This Plan)
Pages fetch real data from endpoints. Implementation:
1. Remove mock data imports and calls
2. Add useEffect to fetch from /api/* endpoints
3. Add loading/error state management
4. Display data using existing components
5. Verify clinic context (redirect if not in clinic)

### Technical Approach
- **Data fetching:** useEffect + fetch API to /api/* routes
- **State management:** useState for data, loading, error
- **Error handling:** Catch fetch errors, show toast notification via sonner
- **Clinic verification:** Check useAuth().clinic_id matches page context
- **Loading states:** Show skeleton/spinner while fetching
- **Type safety:** Import types from lib/types.ts

### Gotchas to Avoid
- Don't call /api/* endpoints on every page render (use useEffect with empty dependency array)
- Don't expose raw API errors to users (format via error-handling)
- Don't forget to check clinic_id in URL params vs auth context (FE-06 requirement)
- Don't remove mock data yet (some demo features might still need it)

---

## Tasks

<task type="auto">
  <name>Task 1: Update dashboard page to load real appointments</name>
  <files>app/(app)/dashboard/page.tsx</files>
  <action>
Replace mock data with real API calls:

1. Remove import of mock appointment functions (e.g., getTodayAppointments)
2. Add state: const [appointments, setAppointments] = useState<Appointment[]>([])
3. Add state: const [loading, setLoading] = useState(true)
4. Add state: const [error, setError] = useState<string | null>(null)
5. Add useEffect hook that:
   - Calls fetch('/api/appointments?fromDate=today&toDate=today')
   - Parses response as { data: Appointment[] }
   - Sets state with returned data
   - Catches errors and shows via toast.error()
   - Sets loading=false when done
6. Keep existing components (AppointmentCard, Card, etc.) but use real data
7. Verify clinic_id from useAuth() matches current clinic (add redirect if needed)
8. Add loading skeleton while loading=true (show placeholder cards)
9. Add error state display (show message if error occurred)

Patterns:
- useEffect hook with dependency on clinic_id: useEffect(() => { ... }, [clinic_id])
- Fetch with query params: fetch(`/api/appointments?fromDate=${today}&clinic_id=${clinic_id}`)
- Error handling: catch(err) => { toast.error(formatErrorMessage(err)); setError(...) }
- Loading state: loading ? <SkeletonCard /> : <AppointmentCard />

Keep pagination logic if it exists (no breaking changes to UI).
  </action>
  <verify>
    <automated>
      grep -q "fetch.*api/appointments\|useEffect" app/\(app\)/dashboard/page.tsx && echo "PASS: API call added" || echo "FAIL"
      grep -q "useState.*appointments\|useState.*loading" app/\(app\)/dashboard/page.tsx && echo "PASS: State added" || echo "FAIL"
      grep -q "mock" app/\(app\)/dashboard/page.tsx | wc -l | grep -E "^[0-1]$" && echo "PASS: Mock removed" || echo "WARNING: Mock still imported"
    </automated>
  </verify>
  <done>app/(app)/dashboard/page.tsx fetches from /api/appointments; loading and error states displayed; mock data removed or deprecated</done>
</task>

<task type="auto">
  <name>Task 2: Update patient list page to load real patients</name>
  <files>app/(app)/pacientes/page.tsx</files>
  <action>
Replace mock patient data with API calls:

1. Remove mock data imports (e.g., patients from mock-data.ts)
2. Add state: const [patients, setPatients] = useState<Patient[]>([])
3. Add state: const [loading, setLoading] = useState(true)
4. Add state: const [searchQuery, setSearchQuery] = useState('')
5. Add useEffect that:
   - Calls fetch('/api/patients')
   - Parses response as { data: Patient[] }
   - Sets state with returned data
   - Handles errors (show toast)
6. Keep existing search/filter logic but apply to real data (not mock)
7. Verify clinic context (add check: if clinic_id from URL doesn't match auth clinic, redirect)
8. Show loading skeleton while fetching
9. Add "No patients found" message when data is empty

Patterns:
- Filter real data: patients.filter(p => p.nombre.includes(searchQuery) || p.apellido.includes(searchQuery))
- Clinic verification: if (clinicIdFromUrl !== authUser.clinic_id) router.push('/clinics')
- Loading: loading && <LoadingState />

Keep existing pagination if implemented.
  </action>
  <verify>
    <automated>
      grep -q "fetch.*api/patients\|useEffect" app/\(app\)/pacientes/page.tsx && echo "PASS: API call added" || echo "FAIL"
      grep -q "useState.*patients" app/\(app\)/pacientes/page.tsx && echo "PASS: State added" || echo "FAIL"
    </automated>
  </verify>
  <done>app/(app)/pacientes/page.tsx fetches from /api/patients; search/filter works with real data; clinic context verified</done>
</task>

<task type="auto">
  <name>Task 3: Update patient detail page to load real medical history</name>
  <files>app/(app)/pacientes/[id]/page.tsx</files>
  <action>
Load real patient data and medical history:

1. Get patientId from route params (params.id)
2. Add state: const [patient, setPatient] = useState<Patient | null>(null)
3. Add state: const [loading, setLoading] = useState(true)
4. Add useEffect that:
   - Calls fetch(`/api/patients/${patientId}`)
   - Parses response as { data: Patient }
   - Sets patient state
   - Verifies clinic_id on response matches auth clinic
   - Shows error toast if clinic doesn't match (FE-06)
5. Display patient info using existing components
6. Load associated data: vital signs, medical history, consultation notes (from additional /api/* endpoints if available)
7. Show loading skeleton while fetching
8. Show 404 or error message if patient not found

Patterns:
- Route param access: const { id } = params
- Clinic verification on response: if (patient.clinicId !== authUser.clinic_id) show error
- Load related data in parallel: Promise.all([...]) to fetch multiple endpoints
  </action>
  <verify>
    <automated>
      grep -q "fetch.*api/patients/\\\${patientId}\|useEffect" app/\(app\)/pacientes/\[id\]/page.tsx && echo "PASS: API call added" || echo "FAIL"
      grep -q "clinic_id.*verify\|clinicId.*auth" app/\(app\)/pacientes/\[id\]/page.tsx && echo "PASS: Clinic verified" || echo "FAIL"
    </automated>
  </verify>
  <done>app/(app)/pacientes/[id]/page.tsx loads real patient data; clinic isolation verified (FE-06); related medical data loaded</done>
</task>

<task type="auto">
  <name>Task 4: Update clinic-specific dashboard pages</name>
  <files>app/(app)/clinics/[clinicId]/dashboard/page.tsx, app/(app)/clinics/[clinicId]/pacientes/page.tsx</files>
  <action>
Update multi-clinic pages to fetch clinic-specific data:

1. For dashboard: Same pattern as main dashboard but with clinicId from URL params
   - Verify user has access to this clinic (call API endpoint or check auth.clinicId)
   - Fetch /api/appointments?clinic_id={clinicId}
   - Display appointments for this specific clinic
   
2. For patient list: Same pattern as main patient list but clinic-specific
   - Verify user has access
   - Fetch /api/patients?clinic_id={clinicId}
   - Show only patients in this clinic

Reuse patterns from Tasks 1-2 but add clinic_id parameter to API calls.
  </action>
  <verify>
    <automated>
      grep -q "fetch.*clinic_id\|clinicId.*params" app/\(app\)/clinics/\[clinicId\]/dashboard/page.tsx && echo "PASS" || echo "FAIL"
      grep -q "fetch.*clinic_id\|clinicId.*params" app/\(app\)/clinics/\[clinicId\]/pacientes/page.tsx && echo "PASS" || echo "FAIL"
    </automated>
  </verify>
  <done>Clinic-specific pages fetch data filtered by clinicId; user access verified; real data displayed</done>
</task>

</tasks>

<verification>
- [ ] All 5 page files fetch from /api/* endpoints
- [ ] No mock data functions used in page rendering logic
- [ ] Loading states displayed while fetching
- [ ] Error states handled with toast notifications
- [ ] Clinic context verified (user can only access their clinic)
- [ ] Real data from Supabase displayed in components
- [ ] TypeScript types properly imported and used
</verification>

<success_criteria>
- Dashboard shows real appointments from database (FE-01)
- Patient list shows real patients from database (FE-02)
- Patient detail pages show real medical data (FE-04)
- Clinic context always verified against auth (FE-06)
- All pages display data with proper loading/error states
</success_criteria>

<output>
After completion, create `.planning/phases/04-api-service-integration/04-api-service-integration-03-SUMMARY.md`
</output>
