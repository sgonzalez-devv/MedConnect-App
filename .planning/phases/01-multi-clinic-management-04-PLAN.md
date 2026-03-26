---
phase: 01-multi-clinic-management
plan: 04
type: execute
wave: 3
depends_on: [01-02]
files_modified:
  - app/(app)/clinics/[clinicId]/pacientes/page.tsx
  - app/(app)/clinics/[clinicId]/calendario/page.tsx
autonomous: true
requirements: [CLINIC-07, CLINIC-08]
user_setup: []

must_haves:
  truths:
    - "Clinic patients view shows only clinic-specific patients"
    - "Clinic calendar shows only clinic-specific appointments"
    - "Patient and appointment counts match clinic data"
    - "Navigation to patient details works within clinic scope"
    - "New patient creation associates with current clinic"
  artifacts:
    - path: "app/(app)/clinics/[clinicId]/pacientes/page.tsx"
      provides: "Clinic-specific patients list view"
      min_lines: 40
    - path: "app/(app)/clinics/[clinicId]/calendario/page.tsx"
      provides: "Clinic-specific calendar/appointments view"
      min_lines: 40
  key_links:
    - from: "app/(app)/clinics/[clinicId]/pacientes/page.tsx"
      to: "lib/mock-data.ts"
      via: "getClinicPatients function"
      pattern: "getClinicPatients"
    - from: "app/(app)/clinics/[clinicId]/calendario/page.tsx"
      to: "lib/mock-data.ts"
      via: "getClinicAppointments function"
      pattern: "getClinicAppointments"
---

<objective>
Create clinic-specific patients and calendar views: adapt existing pacientes and calendario pages to filter by clinic ID, ensuring users see only data belonging to their selected clinic.

Purpose: Complete the core clinic-scoped views (dashboard, patients, calendar). Enable full clinic data isolation across main navigation pages.

Output: Clinic-specific patients list and calendar pages with proper data filtering.
</objective>

<execution_context>
@.planning/phases/01-multi-clinic-management-RESEARCH.md
</execution_context>

<context>
**Foundation:**
- Plan 01: Data partitioning functions (getClinicPatients, getClinicAppointments)
- Plan 02: Clinic layout and routing structure
- Plan 03: Dashboard pattern (use clinic context + filtering functions)

**Existing page patterns:**
- app/(app)/pacientes/page.tsx — displays all patients globally
- app/(app)/calendario/page.tsx — displays all appointments globally
- Will create clinic-scoped versions at /clinics/[clinicId]/pacientes and /clinics/[clinicId]/calendario

**Filtering strategy:**
- Same pattern as dashboard: get currentClinicId from useClinicContext
- Use getClinicPatients(currentClinicId) for patients list
- Use getClinicAppointments(currentClinicId) for calendar/appointments
- Keep UI and styling identical to originals
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create clinic-specific patients page</name>
  <files>app/(app)/clinics/[clinicId]/pacientes/page.tsx</files>
  <action>
    Create new file app/(app)/clinics/[clinicId]/pacientes/page.tsx by adapting app/(app)/pacientes/page.tsx:
    
    1. Copy all imports from original, add:
       import { useClinicContext } from '@/hooks/use-clinic-context'
       import { getClinicPatients } from '@/lib/mock-data'
    
    2. In component:
       - Replace `const allPatients = patients` with:
         const { currentClinicId } = useClinicContext()
         const allPatients = currentClinicId ? getClinicPatients(currentClinicId) : []
    
    3. Keep all filtering, sorting, search functionality identical
    
    4. Keep all UI components, styling, layout identical
    
    5. Links to individual patient pages should work:
       - Original: Link to /pacientes/[id]
       - Clinic version: Keep same Link structure; patient detail page will handle clinic scope in next iteration
    
    Reference: Original at app/(app)/pacientes/page.tsx
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors
    - useClinicContext and getClinicPatients import correctly
  </verify>
  <done>
    - app/(app)/clinics/[clinicId]/pacientes/page.tsx created
    - Displays only clinic-specific patients
    - All UI and functionality preserved from original
    - Patient count reflects clinic data
  </done>
</task>

<task type="auto">
  <name>Task 2: Create clinic-specific calendar page</name>
  <files>app/(app)/clinics/[clinicId]/calendario/page.tsx</files>
  <action>
    Create new file app/(app)/clinics/[clinicId]/calendario/page.tsx by adapting app/(app)/calendario/page.tsx:
    
    1. Copy all imports from original, add:
       import { useClinicContext } from '@/hooks/use-clinic-context'
       import { getClinicAppointments } from '@/lib/mock-data'
    
    2. In component:
       - Identify where appointments data is loaded (likely from getTodayAppointments or similar)
       - Replace with:
         const { currentClinicId } = useClinicContext()
         const appointments = currentClinicId ? getClinicAppointments(currentClinicId) : []
    
    3. If calendar filters by date, keep same logic but applied to clinic-specific appointments
    
    4. Keep all UI components, styling, layout identical
    
    5. Links to appointment detail pages should work as-is
    
    Reference: Original at app/(app)/calendario/page.tsx
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors
    - useClinicContext and getClinicAppointments import correctly
  </verify>
  <done>
    - app/(app)/clinics/[clinicId]/calendario/page.tsx created
    - Displays only clinic-specific appointments
    - All UI and functionality preserved from original
    - Appointment count reflects clinic data
  </done>
</task>

</tasks>

<verification>
Before marking plan complete:

1. **Build success:** `npm run build` succeeds with no TypeScript errors
2. **Patients page:**
   - Navigate to /clinics/clinic-001/pacientes
   - Verify only clinic-001 patients displayed (pac-001, pac-002)
   - Navigate to /clinics/clinic-002/pacientes
   - Verify only clinic-002 patients displayed (pac-003, pac-004, pac-005)
3. **Calendar page:**
   - Navigate to /clinics/clinic-001/calendario
   - Verify only clinic-001 appointments shown
   - Navigate to /clinics/clinic-002/calendario
   - Verify different appointments for clinic-002
4. **Navigation:**
   - Verify links to patient detail pages work
   - Verify links to appointment detail pages work
   - Verify no broken links or 404 errors
5. **No console errors:** Open DevTools and verify clean console
</verification>

<success_criteria>
- ✅ Build succeeds: `npm run build` outputs "Compiled successfully"
- ✅ Clinic patients page: app/(app)/clinics/[clinicId]/pacientes/page.tsx displays clinic-specific patients
- ✅ Clinic calendar page: app/(app)/clinics/[clinicId]/calendario/page.tsx displays clinic-specific appointments
- ✅ Data filtering works: Different clinics show different patients and appointments
- ✅ UI preserved: Layout, styling, functionality match originals
- ✅ Navigation intact: Links to detail pages work

**Test with:**
- Navigate to /clinics/clinic-001/pacientes and verify patient list
- Navigate to /clinics/clinic-001/calendario and verify appointment list
- Navigate to /clinics/clinic-002/pacientes and /clinics/clinic-002/calendario
- Verify different data sets between clinics
- Click on patient/appointment links to verify detail pages accessible
</success_criteria>

<output>
After completion, create `.planning/phases/01-multi-clinic-management/01-04-SUMMARY.md` documenting:
- Clinic-specific patients list implementation
- Clinic-specific calendar implementation
- Data filtering pattern across all main views
- Ready for next plan: group dashboard and analytics
</output>
