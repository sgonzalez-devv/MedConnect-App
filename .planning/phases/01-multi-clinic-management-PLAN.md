---
phase: 01-multi-clinic-management
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/types.ts
  - lib/mock-data.ts
  - lib/theme-utils.ts
  - context/clinic-context.tsx
  - hooks/use-clinic-context.ts
autonomous: true
requirements: [CLINIC-01, CLINIC-02, CLINIC-03]
user_setup: []

must_haves:
  truths:
    - "Clinic context provides current clinic ID and clinic object to any component within provider"
    - "All data models (Patient, Appointment, ConsultationNote, MedicalAttachment) have clinicId field"
    - "Mock data contains 2+ clinics with clinic-specific patients and appointments"
    - "Data access functions filter by clinic ID correctly"
    - "Clinic color palette system supports predefined and custom hex overrides"
  artifacts:
    - path: "lib/types.ts"
      provides: "Extended type definitions with Clinic, ClinicGroup, ClinicColorPalette interfaces"
      min_lines: 200
    - path: "lib/mock-data.ts"
      provides: "Mock data partitioned by clinicId with filtering functions"
      exports: ["clinics", "patients", "getClinicPatients", "getClinicAppointments", "getClinicTodayAppointments"]
    - path: "context/clinic-context.tsx"
      provides: "ClinicProvider and useClinicContext hook"
      exports: ["ClinicProvider", "useClinicContext"]
    - path: "lib/theme-utils.ts"
      provides: "CSS variable generation for clinic color palettes"
      exports: ["generateClinicCSSVariables"]
  key_links:
    - from: "context/clinic-context.tsx"
      to: "lib/mock-data.ts"
      via: "Import clinics from mock data"
      pattern: "import.*clinics.*from"
    - from: "lib/types.ts"
      to: "context/clinic-context.tsx"
      via: "Type definitions for Clinic"
      pattern: "type.*Clinic"
    - from: "lib/mock-data.ts"
      to: "lib/types.ts"
      via: "Data models include clinicId"
      pattern: "clinicId:.*string"
---

<objective>
Implement foundational multi-clinic infrastructure: extend data model with clinic and group types, partition mock data by clinic ID, create clinic context for state management, and establish color palette system for clinic-specific UI theming.

Purpose: Enable the application to support multiple independent clinics with isolated data and customizable branding. Establishes the foundation for clinic-scoped views (dashboard, calendar, patients) and group analytics in subsequent plans.

Output: Type definitions, partitioned mock data, clinic context provider, and theme utilities.
</objective>

<execution_context>
@.planning/phases/01-multi-clinic-management-RESEARCH.md
</execution_context>

<context>
**Key patterns from research:**
- React Context API follows existing SidebarProvider pattern in components/ui/sidebar.tsx
- Data partitioning mirrors existing getTodayAppointments() filtering pattern in lib/mock-data.ts
- Tailwind CSS 4.2 custom properties (oklch variables) enable clinic color system without CSS-in-JS
- No new dependencies required; leverage existing React 19 hooks, Next.js 16, Recharts, Tailwind CSS

**Existing codebase structure:**
- app/(app)/layout.tsx wraps app with SidebarProvider — will later wrap with ClinicProvider
- lib/mock-data.ts exports 5 patients, 23 appointments, consultations, attachments (all will get clinicId field)
- lib/types.ts defines Patient, Appointment, ConsultationNote, MedicalAttachment (extend with clinicId)
- Components use mock data functions (getTodayAppointments, getConversationsWithPatients) — will be extended to clinic scope
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend type definitions with Clinic, ClinicGroup, and color palette types</name>
  <files>lib/types.ts</files>
  <action>
    1. Add clinicId field to existing types:
       - Add `clinicId: string` to Patient interface
       - Add `clinicId: string` to Appointment interface
       - Add `clinicId: string` to ConsultationNote interface
       - Add `clinicId: string` to MedicalAttachment interface
    
    2. Create new interfaces at end of file:
       - Clinic interface with: id, name, location, email, telefono, colorPalette (ClinicColorPalette type)
       - ClinicColorPalette interface with: id, presetName ('teal'|'blue'|'indigo'|'green'|'purple'), customSecondaryHex (optional)
       - ClinicGroup interface with: id, name, clinicIds (string[]), createdAt, ownerId
       - GroupMetrics interface with: totalPatients, totalAppointments, appointmentsThisMonth, completedAppointmentsThisMonth, appointmentsByClinic (Record[string, number])
    
    3. Ensure all new interfaces are exported (use export interface syntax)
    
    Reference implementation from RESEARCH.md lines 196-225 for color palette structure
  </action>
  <verify>
    npm run build succeeds with no TypeScript errors. Check output: "Compiled successfully" and no type errors on lib/types.ts
  </verify>
  <done>
    - All Patient, Appointment, ConsultationNote, MedicalAttachment interfaces have clinicId: string field
    - Clinic interface exported with id, name, location, email, telefono, colorPalette
    - ClinicColorPalette, ClinicGroup, GroupMetrics interfaces exported
    - All new interfaces compile without errors
    - No existing interface fields renamed or removed (backward compatible)
  </done>
</task>

<task type="auto">
  <name>Task 2: Partition mock data by clinic ID and create clinic-scoped data functions</name>
  <files>lib/mock-data.ts</files>
  <action>
    1. Add clinics data export at top of file:
       export const clinics: Clinic[] = [
         { id: 'clinic-001', name: 'Clínica Central', location: 'Santo Domingo', email: 'central@clinic.com', telefono: '+1 809 555 0001', colorPalette: { id: 'palette-001', presetName: 'teal' } },
         { id: 'clinic-002', name: 'Clínica Naco', location: 'Santo Domingo', email: 'naco@clinic.com', telefono: '+1 809 555 0002', colorPalette: { id: 'palette-002', presetName: 'blue' } }
       ]
    
    2. Add clinicGroups data export:
       export const clinicGroups: ClinicGroup[] = [
         { id: 'group-001', name: 'Grupo Central & Naco', clinicIds: ['clinic-001', 'clinic-002'], createdAt: '2024-01-01', ownerId: 'owner-001' }
       ]
    
    3. Update existing patient mock data: add clinicId field to all 5 patients
       - Distribute patients: pac-001, pac-002 to clinic-001; pac-003, pac-004, pac-005 to clinic-002
       - Use distinct patient names/details for each clinic
    
    4. Update existing appointment mock data: add clinicId field to all 23 appointments
       - Filter appointments by the clinic of their associated patient
       - Ensure appointments reference only patients from same clinic
    
    5. Update ConsultationNote mock data: add clinicId field (reference from RESEARCH.md lines 165-191)
    
    6. Update MedicalAttachment mock data: add clinicId field
    
    7. Create new filtering functions at end of exports section:
       - export function getClinicPatients(clinicId: string): Patient[] — filter patients by clinicId
       - export function getClinicAppointments(clinicId: string): Appointment[] — filter appointments by patient clinicId
       - export function getClinicTodayAppointments(clinicId: string): (Appointment & { paciente: Patient })[] — today appointments for clinic
       - export function getGroupMetrics(groupId: string): GroupMetrics — aggregate metrics across group clinics (per RESEARCH.md lines 308-327)
    
    Reference implementation: RESEARCH.md lines 165-191, 308-327
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on clinics, clinicGroups, or filtering function signatures
    - All mock data exports compile correctly
    - Filtering functions are correctly exported and callable
  </verify>
  <done>
    - clinics array exported with 2 clinic entries (clinic-001, clinic-002)
    - clinicGroups array exported with 1 group entry
    - All Patient instances have clinicId field (non-null)
    - All Appointment instances have clinicId derivable from patient (non-null)
    - getClinicPatients, getClinicAppointments, getClinicTodayAppointments functions exported
    - getGroupMetrics function exported
    - Data is logically partitioned: each clinic has distinct patients and appointments
    - No shared/duplicate references between clinic data
  </done>
</task>

<task type="auto">
  <name>Task 3: Create theme utilities for clinic color palette generation</name>
  <files>lib/theme-utils.ts</files>
  <action>
    Create new file lib/theme-utils.ts with:
    
    1. Define color preset mapping (use oklch color space):
       const presets = {
         'teal': { primary: 'oklch(0.52 0.18 181)', accent: 'oklch(0.70 0.19 163)' },
         'blue': { primary: 'oklch(0.49 0.13 263)', accent: 'oklch(0.61 0.19 255)' },
         'indigo': { primary: 'oklch(0.43 0.17 280)', accent: 'oklch(0.60 0.13 286)' },
         'green': { primary: 'oklch(0.51 0.17 142)', accent: 'oklch(0.68 0.18 135)' },
         'purple': { primary: 'oklch(0.49 0.18 308)', accent: 'oklch(0.65 0.22 305)' }
       }
    
    2. Export function generateClinicCSSVariables(palette: ClinicColorPalette): Record<string, string>
       - Look up presetName in presets
       - Return object with '--clinic-primary' and '--clinic-accent' keys
       - If customSecondaryHex provided, use it for '--clinic-accent', otherwise use preset accent
       - Return type: { '--clinic-primary': 'oklch(...)', '--clinic-accent': 'oklch(...) or #hex' }
    
    3. Export function getCSSVariablesAsReactStyle(palette: ClinicColorPalette): React.CSSProperties
       - Convert Record<string, string> to React.CSSProperties (cast as any)
       - Enables inline style={getCSSVariablesAsReactStyle(clinic.colorPalette)}
    
    Reference implementation: RESEARCH.md lines 206-223
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on theme-utils.ts
    - generateClinicCSSVariables exports correctly
    - Function accepts ClinicColorPalette and returns Record<string, string>
  </verify>
  <done>
    - lib/theme-utils.ts created
    - generateClinicCSSVariables exported and callable
    - getCSSVariablesAsReactStyle exported (optional, for convenience)
    - Handles all 5 preset names correctly
    - Handles customSecondaryHex override correctly
    - No runtime errors on function calls
  </done>
</task>

<task type="auto">
  <name>Task 4: Create Clinic context provider and custom hook</name>
  <files>context/clinic-context.tsx</files>
  <action>
    Create new directory context/ if it doesn't exist, then create clinic-context.tsx:
    
    1. Import statements:
       import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
       import type { Clinic } from '@/lib/types'
       import { clinics as mockClinics } from '@/lib/mock-data'
    
    2. Define ClinicContextProps type:
       type ClinicContextProps = {
         currentClinicId: string | null
         currentClinic: Clinic | null
         clinics: Clinic[]
         setCurrentClinicId: (id: string) => void
       }
    
    3. Create context:
       const ClinicContext = createContext<ClinicContextProps | null>(null)
    
    4. Export useClinicContext hook:
       - Check if context exists, throw error if not within ClinicProvider
       - Return ClinicContextProps
       - Error message: "useClinicContext must be used within ClinicProvider"
    
    5. Export ClinicProvider component:
       - Initialize state: currentClinicId = 'clinic-001' (default to first clinic)
       - Compute currentClinic from clinics array and currentClinicId
       - Memoize value object using useMemo on [currentClinicId] dependency
       - Render ClinicContext.Provider with memoized value and children
    
    IMPORTANT: Use useMemo to prevent unnecessary re-renders on context change (addresses Pitfall 1 from RESEARCH.md lines 385-404)
    
    Reference implementation: RESEARCH.md lines 506-550
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on context-clinic.tsx
    - ClinicProvider and useClinicContext export correctly
    - No import errors on lib/types.ts or lib/mock-data.ts
  </verify>
  <done>
    - context/clinic-context.tsx created
    - ClinicProvider component exported
    - useClinicContext hook exported
    - Context properly typed with ClinicContextProps
    - Value memoized to prevent unnecessary re-renders
    - Default clinic set to 'clinic-001'
    - Error handling for context usage outside provider
  </done>
</task>

<task type="auto">
  <name>Task 5: Create convenience hook for clinic context access</name>
  <files>hooks/use-clinic-context.ts</files>
  <action>
    Create new file hooks/use-clinic-context.ts (convenience export):
    
    1. Import useClinicContext from context/clinic-context.tsx
    2. Re-export it: export { useClinicContext } from '@/context/clinic-context'
    
    This allows components to import from '@/hooks/use-clinic-context' instead of '@/context/clinic-context' (consistent with existing hooks structure)
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors
    - useClinicContext importable from @/hooks/use-clinic-context
  </verify>
  <done>
    - hooks/use-clinic-context.ts created
    - useClinicContext re-exported for consistency
    - Import path works from both @/hooks and @/context
  </done>
</task>

</tasks>

<verification>
Before marking plan complete:

1. **Type safety:** Run `npm run build` and verify TypeScript compiles all .ts/.tsx files without errors
2. **Data integrity:** Verify in lib/mock-data.ts:
   - All 5 patients have clinicId field assigned (check patients export)
   - All 23 appointments have clinicId (derived from patient.clinicId)
   - clinics array has 2 entries with correct structure
   - clinicGroups array has 1 entry with correct structure
3. **Function exports:** Verify all filtering functions work:
   - getClinicPatients('clinic-001').length > 0
   - getClinicAppointments('clinic-001').length > 0
   - getClinicTodayAppointments('clinic-001').length >= 0 (may be 0)
   - getGroupMetrics('group-001') returns GroupMetrics with proper structure
4. **Context functionality:** Verify context compiles and exports:
   - ClinicProvider is a valid React component
   - useClinicContext returns proper ClinicContextProps type
   - No console errors when importing
5. **Color system:** Verify theme-utils.ts:
   - generateClinicCSSVariables('teal') returns object with --clinic-primary and --clinic-accent keys
   - handlecustomSecondaryHex: verify custom hex overrides correctly
</verification>

<success_criteria>
- ✅ TypeScript build succeeds: `npm run build` outputs "Compiled successfully"
- ✅ All data models extended: Patient, Appointment, ConsultationNote, MedicalAttachment all include clinicId field
- ✅ Mock data partitioned: 2 clinics with distinct patients and appointments
- ✅ Data access functions work: getClinicPatients, getClinicAppointments, getClinicTodayAppointments, getGroupMetrics are exported and callable
- ✅ Clinic context created: ClinicProvider component wraps app, useClinicContext hook accessible
- ✅ Color palette system functional: generateClinicCSSVariables returns CSS variable map for all 5 presets
- ✅ No breaking changes: Existing code patterns maintained, backward compatible with current single-clinic usage

**Test with:**
- Open browser DevTools and check console for no import/type errors
- Verify npm run build completes without errors
- Manually instantiate ClinicProvider wrapping a test component to ensure no runtime errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-multi-clinic-management/01-01-SUMMARY.md` documenting:
- Clinic type definitions and mock data structure
- Context provider implementation and usage pattern
- Color palette system (presets + custom hex)
- Data partitioning functions and their signatures
- Key decisions and patterns established for downstream plans
</output>
