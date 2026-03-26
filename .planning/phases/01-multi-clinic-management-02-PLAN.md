---
phase: 01-multi-clinic-management
plan: 02
type: execute
wave: 2
depends_on: [01-01]
files_modified:
  - components/clinic-selector.tsx
  - app/(app)/layout.tsx
  - app/(app)/clinics/layout.tsx
  - app/(app)/clinics/page.tsx
autonomous: true
requirements: [CLINIC-04, CLINIC-05]
user_setup: []

must_haves:
  truths:
    - "Clinic context provider wraps entire app in layout"
    - "Current clinic can be changed via dropdown selector in sidebar"
    - "Clinic name and colors display in UI when selected"
    - "Navigation to /clinics/[clinicId] routes set clinic context"
    - "CSS variables for clinic colors are applied to clinic-scoped pages"
  artifacts:
    - path: "components/clinic-selector.tsx"
      provides: "Dropdown component for switching between clinics"
      exports: ["ClinicSelector"]
    - path: "app/(app)/clinics/layout.tsx"
      provides: "Clinic-scoped layout that sets context and applies color variables"
      min_lines: 30
    - path: "app/(app)/clinics/page.tsx"
      provides: "Clinic selector/list page"
      min_lines: 40
    - path: "app/(app)/layout.tsx"
      provides: "Updated root layout wrapping children with ClinicProvider"
      modified_from: "Original version"
  key_links:
    - from: "components/clinic-selector.tsx"
      to: "hooks/use-clinic-context.ts"
      via: "useClinicContext hook"
      pattern: "useClinicContext"
    - from: "app/(app)/layout.tsx"
      to: "context/clinic-context.tsx"
      via: "ClinicProvider wrapper"
      pattern: "ClinicProvider"
    - from: "app/(app)/clinics/layout.tsx"
      to: "lib/theme-utils.ts"
      via: "generateClinicCSSVariables"
      pattern: "generateClinicCSSVariables"
---

<objective>
Implement clinic selector component and clinic-scoped routing: add ClinicProvider to root layout, create clinic dropdown selector in sidebar, establish clinic-scoped routes (/clinics/[clinicId]) that set context and apply color palettes, and create clinic list page.

Purpose: Enable users to switch between clinics and view clinic-specific data. Establish URL-based clinic isolation so clinic-specific dashboard, patients, and calendar pages can filter data by clinicId from route params.

Output: Clinic selector UI, updated layouts with provider and color system, clinic list page, routing structure for clinic-scoped pages.
</objective>

<execution_context>
@.planning/phases/01-multi-clinic-management-RESEARCH.md
</execution_context>

<context>
**Pattern references:**
- Clinic dropdown selector mirrors existing app-sidebar.tsx DropdownMenu pattern (RESEARCH.md lines 576-617)
- Clinic layout color application uses Tailwind arbitrary values with CSS variables (RESEARCH.md lines 620-647)
- Pitfall 3 (RESEARCH.md lines 426-444) addresses route params / context sync via useEffect in layout

**Integration points:**
- app/(app)/layout.tsx currently wraps with SidebarProvider only; will add ClinicProvider wrapper
- app/(app)/dashboard/page.tsx currently uses getTodayAppointments() global function; will be extended to use getClinicTodayAppointments(clinicId)
- Sidebar component (AppSidebar) can include ClinicSelector without major refactor

**File structure (from RESEARCH.md lines 63-105):**
- /clinics — clinic selector/list page
- /clinics/[clinicId] — clinic-scoped routes
- /clinics/[clinicId]/dashboard — clinic-specific dashboard (created in next plan)
- /clinics/[clinicId]/pacientes — clinic-specific patients (created in next plan)
- /clinics/[clinicId]/calendario — clinic-specific calendar (created in next plan)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create clinic selector dropdown component</name>
  <files>components/clinic-selector.tsx</files>
  <action>
    Create new file components/clinic-selector.tsx:
    
    1. Add "use client" directive at top
    
    2. Imports:
       import { useClinicContext } from '@/hooks/use-clinic-context'
       import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
       import { Button } from '@/components/ui/button'
       import { Building2, ChevronDown } from 'lucide-react'
    
    3. Export ClinicSelector component:
       - Get currentClinic, clinics, setCurrentClinicId from useClinicContext
       - Return null if currentClinic is null
       - Render DropdownMenu with:
         * DropdownMenuTrigger: Button with variant="ghost", gap-2 class, contains Building2 icon, current clinic name, ChevronDown icon
         * DropdownMenuContent with align="end": map over clinics array
         * DropdownMenuItem for each clinic with onClick={() => setCurrentClinicId(clinic.id)}
         * Highlight current clinic with className={currentClinic.id === clinic.id ? 'bg-accent' : ''}
    
    Reference implementation: RESEARCH.md lines 576-617
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on clinic-selector.tsx
    - ClinicSelector exports correctly
    - All imports (useClinicContext, UI components, icons) resolve
  </verify>
  <done>
    - components/clinic-selector.tsx created
    - ClinicSelector component exported and callable
    - Dropdown menu renders with list of clinics
    - Click handler updates context correctly (no errors on setCurrentClinicId)
    - Current clinic highlighted in dropdown
  </done>
</task>

<task type="auto">
  <name>Task 2: Update root app layout to wrap with ClinicProvider</name>
  <files>app/(app)/layout.tsx</files>
  <action>
    Edit app/(app)/layout.tsx:
    
    1. Add import at top:
       import { ClinicProvider } from '@/context/clinic-context'
    
    2. Wrap entire SidebarProvider with ClinicProvider:
       Change from:
       <SidebarProvider>
         <AppSidebar />
         ...
       </SidebarProvider>
       
       To:
       <ClinicProvider>
         <SidebarProvider>
           <AppSidebar />
           ...
         </SidebarProvider>
       </ClinicProvider>
    
    This ensures ClinicProvider is the outermost provider and wraps SidebarProvider.
    
    IMPORTANT: Keep "use client" directive as is. Keep existing structure intact; only add ClinicProvider wrapper.
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on layout.tsx
    - ClinicProvider imports correctly
    - App loads without errors
  </verify>
  <done>
    - app/(app)/layout.tsx modified to wrap with ClinicProvider
    - ClinicProvider is outermost provider
    - All existing layout functionality preserved
    - No breaking changes to existing structure
  </done>
</task>

<task type="auto">
  <name>Task 3: Add clinic selector to sidebar (integrate into AppSidebar)</name>
  <files>components/app-sidebar.tsx</files>
  <action>
    Edit components/app-sidebar.tsx to add clinic selector to sidebar:
    
    1. Import at top:
       import { ClinicSelector } from '@/components/clinic-selector'
    
    2. Find the sidebar footer or header area (typically inside SidebarContent or SidebarFooter)
       - Look for existing user profile section or footer area
       - If exists, add ClinicSelector as a separate item above or below existing footer content
       - If no footer exists, add ClinicSelector before the closing SidebarContent/SidebarInset
    
    3. Render ClinicSelector component:
       <ClinicSelector />
    
    4. Optional: Add visual separator if needed (use Separator component)
    
    Note: Consult existing app-sidebar.tsx structure to place ClinicSelector in most natural location (likely near bottom, above user profile if exists)
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on app-sidebar.tsx
    - ClinicSelector imports and renders
    - No console errors on page load
  </verify>
  <done>
    - ClinicSelector integrated into AppSidebar
    - Dropdown visible and interactive
    - No styling conflicts with existing sidebar elements
  </done>
</task>

<task type="auto">
  <name>Task 4: Create clinic-scoped layout with color palette support</name>
  <files>app/(app)/clinics/layout.tsx</files>
  <action>
    Create new file app/(app)/clinics/layout.tsx (directory structure: app/(app)/clinics/layout.tsx):
    
    1. Add "use client" directive
    
    2. Imports:
       import { useEffect } from 'react'
       import { useClinicContext } from '@/hooks/use-clinic-context'
       import { generateClinicCSSVariables } from '@/lib/theme-utils'
    
    3. Define layout component:
       export default function ClinicLayout({ 
         children, 
         params 
       }: { 
         children: React.ReactNode
         params: { clinicId: string }
       })
    
    4. Inside component:
       - Get currentClinic, setCurrentClinicId from useClinicContext()
       - Use useEffect to sync route param clinicId to context:
         useEffect(() => {
           setCurrentClinicId(params.clinicId)
         }, [params.clinicId, setCurrentClinicId])
       
       - Generate CSS variables: const cssVars = currentClinic ? (generateClinicCSSVariables(currentClinic.colorPalette) as React.CSSProperties) : {}
       
       - Render:
         <div style={cssVars}>
           {children}
         </div>
    
    5. Do NOT add header or navigation here; just apply color variables and render children
    
    Reference implementation: RESEARCH.md lines 620-647, Pitfall 3 fix lines 434-444
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on clinics/layout.tsx
    - useEffect hook compiles correctly
    - CSS variable generation compiles
  </verify>
  <done>
    - app/(app)/clinics/layout.tsx created
    - Route param clinicId synced to context via useEffect
    - CSS variables generated and applied to root div
    - Color palette system integrated with layout
  </done>
</task>

<task type="auto">
  <name>Task 5: Create clinic selector/list page</name>
  <files>app/(app)/clinics/page.tsx</files>
  <action>
    Create new file app/(app)/clinics/page.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import Link from 'next/link'
       import { useClinicContext } from '@/hooks/use-clinic-context'
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
       import { Button } from '@/components/ui/button'
       import { Building2, ArrowRight } from 'lucide-react'
    
    3. Export default function ClinicListPage():
       - Get clinics and currentClinic from useClinicContext()
       - Render page title: "Selecciona una Clínica"
       - Render description: "Elige una clínica para continuar"
       - Map over clinics array and render Card for each:
         * Card header: clinic.name with Building2 icon
         * Card description: clinic.location
         * Card content: clinic.email, clinic.telefono
         * Button: Link to /clinics/[clinicId]/dashboard with text "Ir al Dashboard"
         * If currentClinic.id === clinic.id, mark as "Selected" or show checkmark
       
       Layout: Grid of cards (2 columns on md+, 1 on mobile using grid-cols-1 md:grid-cols-2)
    
    No complex styling needed; use existing UI components and Tailwind utilities.
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on clinics/page.tsx
    - ClinicListPage exports correctly
    - All imports resolve
  </verify>
  <done>
    - app/(app)/clinics/page.tsx created
    - Clinic list displayed with card layout
    - Each clinic has name, location, email, phone
    - Links to clinic dashboard work (/clinics/[clinicId]/dashboard)
    - Current clinic highlighted
  </done>
</task>

</tasks>

<verification>
Before marking plan complete:

1. **Build success:** `npm run build` succeeds with no TypeScript errors
2. **Clinic selector visible:**
   - Navigate to app in browser
   - Verify clinic dropdown appears in sidebar (Building2 icon + current clinic name)
   - Click dropdown and verify all clinics listed
   - Select different clinic and verify context updates
3. **Clinic list page:**
   - Navigate to /clinics
   - Verify all clinics displayed in card layout
   - Verify each card shows name, location, email, phone
   - Verify links to /clinics/[clinicId]/dashboard work (even if pages don't exist yet)
4. **Color system integration:**
   - Navigate to /clinics/clinic-001 (URL)
   - Verify CSS variables are applied (check browser DevTools Inspector under Styles)
   - Verify clinic colors can be seen in future updates (this plan doesn't change visual appearance yet)
5. **Context syncing:**
   - Navigate to /clinics/clinic-001
   - Verify clinic context updates to clinic-001 (can inspect in React DevTools if available)
   - Verify clinic dropdown shows clinic-001 as selected
   - Navigate to /clinics/clinic-002
   - Verify context updates and dropdown reflects new selection
</verification>

<success_criteria>
- ✅ Build succeeds: `npm run build` outputs "Compiled successfully"
- ✅ Clinic selector renders: Building2 icon + clinic name visible in sidebar
- ✅ Dropdown functional: Clicking selector shows list of clinics, selection updates context
- ✅ Clinic list page: /clinics displays all clinics in card layout with correct information
- ✅ Clinic layout created: /clinics/[clinicId] routes work and set context
- ✅ CSS variables applied: generateClinicCSSVariables integrated into layout.tsx
- ✅ Context sync: useEffect in clinic layout syncs route params to context

**Test with:**
- Navigate to /clinics and verify all clinics displayed
- Click clinic selector dropdown and switch between clinics
- Verify context updates and dropdown highlights correct clinic
- Inspect browser DevTools to confirm CSS variables applied (--clinic-primary, --clinic-accent)
</success_criteria>

<output>
After completion, create `.planning/phases/01-multi-clinic-management/01-02-SUMMARY.md` documenting:
- Clinic selector component implementation and integration point
- Clinic layout structure and color variable application
- Clinic list page and routing structure
- Context syncing pattern (route params → context)
- Ready for next plan: clinic-specific dashboard, patients, calendar views
</output>
