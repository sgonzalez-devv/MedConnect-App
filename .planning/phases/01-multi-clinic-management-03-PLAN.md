---
phase: 01-multi-clinic-management
plan: 03
type: execute
wave: 3
depends_on: [01-02]
files_modified:
  - app/(app)/clinics/[clinicId]/dashboard/page.tsx
autonomous: true
requirements: [CLINIC-06]
user_setup: []

must_haves:
  truths:
    - "Clinic dashboard filters data by current clinic ID"
    - "Only clinic-specific patients appear on dashboard"
    - "Only clinic-specific appointments appear on dashboard"
    - "Stats reflect clinic-specific counts (appointments, patients, etc.)"
    - "Dashboard color scheme reflects clinic color palette"
  artifacts:
    - path: "app/(app)/clinics/[clinicId]/dashboard/page.tsx"
      provides: "Clinic-specific dashboard view"
      min_lines: 150
  key_links:
    - from: "app/(app)/clinics/[clinicId]/dashboard/page.tsx"
      to: "lib/mock-data.ts"
      via: "getClinicPatients, getClinicTodayAppointments, getClinicAppointments"
      pattern: "getClinic(Patients|Appointments|TodayAppointments)"
    - from: "app/(app)/clinics/[clinicId]/dashboard/page.tsx"
      to: "hooks/use-clinic-context.ts"
      via: "useClinicContext to get current clinic"
      pattern: "useClinicContext"
---

<objective>
Create clinic-specific dashboard that filters all data by current clinic ID: adapt existing dashboard page to use clinic-scoped data functions instead of global data, ensuring patients, appointments, and stats reflect only the selected clinic's data.

Purpose: Enable each clinic to view its own dashboard with clinic-specific metrics, appointments, and patient list. Establishes pattern for filtering existing pages by clinic ID.

Output: Clinic-specific dashboard page that properly isolates data per clinic.
</objective>

<execution_context>
@.planning/phases/01-multi-clinic-management-RESEARCH.md
</execution_context>

<context>
**Foundation from prior plans:**
- Plan 01: Mock data partitioned with clinicId fields and filtering functions (getClinicPatients, getClinicTodayAppointments)
- Plan 02: Clinic layout syncs route params to context, applies color variables

**Existing dashboard reference:**
- app/(app)/dashboard/page.tsx currently uses getTodayAppointments() (global)
- Will adapt pattern to use getClinicTodayAppointments(clinicId) (clinic-scoped)
- Key functions to replace:
  * getTodayAppointments() → getClinicTodayAppointments(clinicId)
  * patients array → getClinicPatients(clinicId)
  * getConversationsWithPatients() → filter by clinic patients
  * notifications → already global; keep as-is

**Data model:**
- currentClinic from context has all clinic information
- Route params clinicId available for verification (context is source of truth after sync in layout)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create clinic-specific dashboard page by adapting existing dashboard</name>
  <files>app/(app)/clinics/[clinicId]/dashboard/page.tsx</files>
  <action>
    Create new file app/(app)/clinics/[clinicId]/dashboard/page.tsx by copying and modifying existing app/(app)/dashboard/page.tsx:
    
    1. Keep all imports as-is, but add:
       import { useClinicContext } from '@/hooks/use-clinic-context'
       import { getClinicPatients, getClinicTodayAppointments, getClinicAppointments } from '@/lib/mock-data'
    
    2. In the component:
       - Replace `const todayAppointments = getTodayAppointments()` with:
         const { currentClinicId } = useClinicContext()
         const todayAppointments = currentClinicId ? getClinicTodayAppointments(currentClinicId) : []
       
       - Replace `const allPatients = patients` with:
         const allPatients = currentClinicId ? getClinicPatients(currentClinicId) : []
       
       - For any other data functions using global data:
         * getConversationsWithPatients() → filter by allPatients (clinic-specific)
         * notifications → keep as-is (global)
         * stats calculations → update to use clinic-specific counts
    
    3. Keep all styling, layout, and component structure identical to original dashboard
    
    4. Statistics should now reflect clinic-specific data:
       - "Citas de Hoy" = todayAppointments.length (clinic-specific)
       - "Pacientes Totales" = allPatients.length (clinic-specific)
       - Other stats adjust to use clinic-specific data
    
    Reference: Original dashboard at app/(app)/dashboard/page.tsx (use as template)
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on clinics/[clinicId]/dashboard/page.tsx
    - useClinicContext imports correctly
    - getClinicTodayAppointments, getClinicPatients import correctly
  </verify>
  <done>
    - app/(app)/clinics/[clinicId]/dashboard/page.tsx created
    - Uses getClinicTodayAppointments(currentClinicId) instead of getTodayAppointments()
    - Uses getClinicPatients(currentClinicId) instead of global patients array
    - All stats reflect clinic-specific data
    - Color palette applied via parent clinic layout
    - No breaking changes to UI or styling
  </done>
</task>

</tasks>

<verification>
Before marking plan complete:

1. **Build success:** `npm run build` succeeds with no TypeScript errors
2. **Dashboard page exists:** /clinics/clinic-001/dashboard loads without errors
3. **Data isolation:**
   - Navigate to /clinics/clinic-001/dashboard
   - Verify "Citas de Hoy" count matches clinic-001 appointments only
   - Verify "Pacientes Totales" matches clinic-001 patients only
   - Navigate to /clinics/clinic-002/dashboard
   - Verify different counts for clinic-002 (if clinic-002 has different data)
4. **Styling preservation:**
   - Dashboard layout, cards, and styling match original dashboard
   - Clinic colors applied from context (optional visual verification)
5. **No console errors:** Open browser DevTools and verify no errors on page load
</verification>

<success_criteria>
- ✅ Build succeeds: `npm run build` outputs "Compiled successfully"
- ✅ Dashboard page created: app/(app)/clinics/[clinicId]/dashboard/page.tsx exists and renders
- ✅ Data filtering works: Only clinic-specific data displayed (verify by navigating to different clinic IDs)
- ✅ Stats accurate: Appointment counts, patient counts reflect clinic-specific data
- ✅ UI preserved: Layout, styling, components unchanged from original dashboard
- ✅ Context usage: currentClinicId obtained from useClinicContext hook

**Test with:**
- Navigate to /clinics/clinic-001/dashboard and verify stats
- Navigate to /clinics/clinic-002/dashboard and verify different stats
- Open browser DevTools console and verify no errors
- Click clinic selector dropdown and switch between clinics; verify dashboard data updates
</success_criteria>

<output>
After completion, create `.planning/phases/01-multi-clinic-management/01-03-SUMMARY.md` documenting:
- Clinic-specific dashboard implementation
- Data filtering pattern (getClinicTodayAppointments, getClinicPatients)
- Stats calculation for clinic-specific data
- Ready for next plan: clinic-specific patients and calendar views
</output>
