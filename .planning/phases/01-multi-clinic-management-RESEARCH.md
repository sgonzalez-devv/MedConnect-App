# Phase 1: Multi-Clinic Management System - Research

**Researched:** 2026-03-25
**Domain:** Healthcare management platform - multi-tenant clinic data isolation and UI customization
**Confidence:** HIGH (90%)

## Summary

MedConnect's existing architecture supports single-clinic operation with mock data and client-side state management via React hooks. Implementing multi-clinic management requires extending the type system to define clinics and groups, implementing a clinic context for current clinic selection, partitioning mock data by clinic ID, building a clinic switcher in the sidebar, designing clinic-specific color palettes (hybrid predefined + custom hex), and creating group dashboards with aggregated analytics.

The React 19 + Next.js 16 stack already uses `SidebarProvider` (Radix UI context pattern), so clinic context follows the same established pattern. No new dependencies needed; leverage existing Recharts for group-level analytics and current Tailwind CSS color system for palette management.

**Primary recommendation:** Implement clinic context as a React Context paired with a custom hook, partition mock data by clinic ID in lib/mock-data.ts, extend AppSidebar with a clinic selector dropdown, and use Tailwind CSS custom properties (oklch variables in globals.css) for clinic color overrides.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI rendering and state via hooks | Native context + hooks sufficient for clinic switching; no Redux needed |
| Next.js | 16.1.6 | Routing framework with App Router | Dynamic routes like `/clinics/[clinicId]/dashboard` and `/groups/[groupId]` leverage built-in routing |
| TypeScript | 5.7.3 | Type safety for clinic/group types | Strict mode prevents runtime data isolation bugs |
| Tailwind CSS | 4.2.0 | Utility-first styling with custom properties | oklch() variables enable per-clinic color palettes without CSS-in-JS |

### State Management (No Redux/Zustand)
| Tool | Version | Purpose | Pattern |
|------|---------|---------|---------|
| React Context | 19.2.4 | Clinic/group selection state | `createContext` + `useContext` custom hook, follows existing `SidebarProvider` pattern |
| React Hooks | 19.2.4 | Local component state | `useState` for clinic data, `useCallback` for selection handlers |

### Supporting (Data & UI)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Recharts | 2.15.0 | Group dashboard charts (multi-clinic analytics) | Comparative trends, aggregated metrics, growth rates |
| date-fns | 4.1.0 | Date handling for clinic-specific data ranges | Clinic analytics filtered by date ranges |
| Radix UI (Sidebar) | 1.2.16 | Sidebar primitives for clinic selector | Dropdown/menu for switching between clinics |
| Lucide React | 0.564.0 | Icons for clinic selector UI | Clinic switcher, group icons, analytics charts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Context | Zustand | Context is lighter-weight for single app-level concern (clinic selection); Zustand adds dependencies |
| Context + hooks | Redux | Redux overkill for clinic switching; adds 40+ KB bundle cost |
| Tailwind custom properties | CSS-in-JS (Emotion/styled-components) | Tailwind CSS variables reduce runtime overhead; CSS-in-JS needed only for dynamic user-defined colors |
| Route params `/clinics/[clinicId]` | Query params `/dashboard?clinicId=...` | Dynamic routes cleaner for SEO and direct sharing; easier to protect routes with middleware later |

**Installation:**
```bash
# No new packages needed; use existing stack
pnpm list react recharts tailwindcss # Verify existing versions
```

**Version verification:** Confirmed from package.json:
- React 19.2.4 (latest)
- Next.js 16.1.6 (Nov 2025 release)
- Tailwind CSS 4.2.0 (latest with oklch support)
- Recharts 2.15.0 (March 2025 release)

## Architecture Patterns

### Recommended Project Structure

```
lib/
├── types.ts                    # Extended: Clinic, ClinicGroup, ClinicSettings
├── mock-data.ts               # Partitioned by clinicId
├── clinic-utils.ts            # Helper: clinic-specific filters, aggregations
└── theme-utils.ts             # Helper: clinic palette generation (predefined + custom)

hooks/
├── use-clinic-context.ts       # NEW: custom hook for clinic context
└── use-current-clinic.ts       # NEW: shorthand for current clinic + data

context/
├── clinic-context.tsx          # NEW: ClinicProvider + ClinicContext
└── clinic-provider.tsx         # NEW: wrapper component for app

components/
├── clinic-selector.tsx         # NEW: dropdown in sidebar
├── clinic-color-preview.tsx    # NEW: color palette preview
├── group-dashboard-card.tsx    # NEW: group metrics card
└── group-analytics/            # NEW folder
    ├── comparative-chart.tsx   # NEW: side-by-side clinic comparison
    ├── trend-chart.tsx         # NEW: multi-line trend over time
    └── growth-rate-card.tsx    # NEW: YoY/growth metrics

app/(app)/
├── clinics/
│   ├── [clinicId]/
│   │   ├── layout.tsx          # NEW: clinic-scoped layout (breadcrumb, palette switch)
│   │   ├── dashboard/          # Reuse existing dashboard, filter by clinicId
│   │   │   └── page.tsx        # NEW: clinic-specific dashboard
│   │   ├── pacientes/          # Existing, filter by clinicId
│   │   ├── calendario/         # Existing, filter by clinicId
│   │   └── settings/           # NEW: clinic color customization
│   └── page.tsx                # NEW: clinic selector screen
├── groups/
│   ├── [groupId]/
│   │   ├── layout.tsx          # NEW: group-scoped layout
│   │   ├── dashboard/
│   │   │   └── page.tsx        # NEW: group analytics dashboard
│   │   └── settings/           # NEW: group management
│   └── page.tsx                # NEW: groups list
└── dashboard/                  # Keep existing, becomes clinic switcher if no clinicId selected
    └── page.tsx                # Reuse existing, or redirect to /clinics/[clinicId]/dashboard
```

### Pattern 1: Clinic Context (React 19 Hooks)

**What:** Global clinic selection state using React Context API, following the existing `SidebarProvider` pattern in Radix UI sidebar component.

**When to use:** Clinic switching, displaying current clinic name/colors in header, filtering data by clinic ID across all pages.

**Why:** Context is built-in to React, no external state library needed. Matches existing codebase pattern (SidebarProvider, TooltipProvider).

**Example (from existing codebase pattern):**

```typescript
// context/clinic-context.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Clinic } from '@/lib/types'

type ClinicContextProps = {
  currentClinicId: string | null
  currentClinic: Clinic | null
  setCurrentClinicId: (id: string) => void
  clinics: Clinic[]
}

const ClinicContext = createContext<ClinicContextProps | null>(null)

export function useClinicContext() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinicContext must be used within ClinicProvider')
  }
  return context
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [currentClinicId, setCurrentClinicId] = useState<string | null>('clinic-001')
  const [clinics] = useState<Clinic[]>(() => getClinicsFromMockData())

  const currentClinic = clinics.find((c) => c.id === currentClinicId) || null

  return (
    <ClinicContext.Provider
      value={{ currentClinicId, currentClinic, setCurrentClinicId, clinics }}
    >
      {children}
    </ClinicContext.Provider>
  )
}
```

**Source:** React 19 Context API documentation; pattern matches existing `SidebarProvider` in `components/ui/sidebar.tsx` (lines 45-54)

### Pattern 2: Data Partitioning by Clinic ID

**What:** Mock data functions filtered by clinic ID instead of returning global data.

**When to use:** Every data access in pages (dashboard, patients, appointments) must check current clinic context.

**Example:**

```typescript
// lib/mock-data.ts - partitioned structure

export const clinics: Clinic[] = [
  { id: 'clinic-001', name: 'Clínica Central', location: 'Santo Domingo', ... },
  { id: 'clinic-002', name: 'Clínica Naco', location: 'Santo Domingo', ... },
]

// Global data, tagged with clinicId
export const patients: Patient[] = [
  { id: 'pac-001', clinicId: 'clinic-001', nombre: 'Juan Carlos', ... },
  { id: 'pac-002', clinicId: 'clinic-001', nombre: 'Yolanda', ... },
  { id: 'pac-003', clinicId: 'clinic-002', nombre: 'Rafael', ... },
]

// Filter functions
export function getClinicPatients(clinicId: string): Patient[] {
  return patients.filter((p) => p.clinicId === clinicId)
}

export function getClinicAppointments(clinicId: string): Appointment[] {
  return appointments.filter((a) => {
    const patient = getPatientById(a.pacienteId)
    return patient?.clinicId === clinicId
  })
}
```

**Source:** Current `mock-data.ts` functions (lines 804-867) already filter by ID; extend pattern to clinic scope.

### Pattern 3: Clinic Color Palette (Hybrid Predefined + Custom)

**What:** Two-tier system: predefined Tailwind color palettes (e.g., "teal", "blue", "indigo") + custom hex override for secondary colors.

**When to use:** Clinic settings page, header/sidebar rendering with clinic colors, dashboard card theming.

**How Tailwind 4 supports it:**

```typescript
// lib/theme-utils.ts
export interface ClinicColorPalette {
  id: string
  presetName: 'teal' | 'blue' | 'indigo' | 'green' | 'purple'
  customSecondaryHex?: string // Optional override
}

export function generateClinicCSSVariables(palette: ClinicColorPalette): Record<string, string> {
  const presets = {
    teal: { primary: 'oklch(0.52 0.18 181)', accent: 'oklch(0.70 0.19 163)' },
    blue: { primary: 'oklch(0.49 0.13 263)', accent: 'oklch(0.61 0.19 255)' },
    indigo: { primary: 'oklch(0.43 0.17 280)', accent: 'oklch(0.60 0.13 286)' },
  }
  const base = presets[palette.presetName]
  return {
    '--clinic-primary': base.primary,
    '--clinic-accent': palette.customSecondaryHex || base.accent,
  }
}
```

**Rendering in React:**

```typescript
// app/(app)/clinics/[clinicId]/layout.tsx
export default function ClinicLayout({ children, params }: Props) {
  const { clinic } = useClinicContext()
  const cssVars = clinic ? generateClinicCSSVariables(clinic.colorPalette) : {}

  return (
    <div style={cssVars as React.CSSProperties}>
      {children}
    </div>
  )
}
```

**Tailwind CSS integration (globals.css):**

```css
:root {
  --clinic-primary: /* default teal */;
  --clinic-accent: /* default teal accent */;
}

/* Use in Tailwind via arbitrary values */
.clinic-header {
  @apply bg-[oklch(var(--clinic-primary))];
}
```

**Source:** Tailwind CSS 4.2.0 documentation on CSS custom properties; existing `globals.css` (line 1-40) already uses oklch() variables.

### Pattern 4: URL Routing for Clinic/Group Isolation

**What:** Dynamic routes segment data and UI by clinic or group ID.

**When to use:** Navigation, bookmarking, sharing clinic-specific links, protecting routes.

**Structure:**

```
/clinics                      # Clinic selector / list
/clinics/clinic-001/dashboard # Clinic-specific dashboard (current context = clinic-001)
/clinics/clinic-001/pacientes
/groups                       # Groups list
/groups/group-001/dashboard   # Group analytics dashboard
/groups/group-001/settings    # Group management
```

**Layout nesting:** Each `[clinicId]/layout.tsx` extracts `params.clinicId`, sets clinic context, renders child pages. Pages use clinic context to filter data.

**Source:** Next.js 16 App Router dynamic routes documentation; existing codebase uses `app/(app)/pacientes/[id]/page.tsx` pattern (lines in structure show params usage).

### Pattern 5: Group Dashboard Aggregation

**What:** Dashboard that aggregates metrics across multiple clinics in a group: comparative charts, trend lines, growth rates.

**When to use:** Management/owner level views; optional (single clinics work without groups).

**Data structure:**

```typescript
export interface ClinicGroup {
  id: string
  name: string
  clinicIds: string[]
  createdAt: string
  ownerId: string
}

export interface GroupMetrics {
  totalPatients: number
  totalAppointmentsThisMonth: number
  completedAppointmentsThisMonth: number
  averagePatientSatisfaction?: number
  appointmentsByType: Record<string, number>
  appointmentsByClinic: Record<string, number> // clinic-001 -> 15, clinic-002 -> 12
}
```

**Aggregation function:**

```typescript
export function getGroupMetrics(groupId: string): GroupMetrics {
  const group = clinicGroups.find((g) => g.id === groupId)
  if (!group) throw new Error('Group not found')

  const allPatients = group.clinicIds.flatMap((cid) => getClinicPatients(cid))
  const allAppointments = group.clinicIds.flatMap((cid) => getClinicAppointments(cid))

  return {
    totalPatients: allPatients.length,
    totalAppointmentsThisMonth: allAppointments.filter(/* thisMonth filter */).length,
    // ... more aggregations
    appointmentsByClinic: Object.fromEntries(
      group.clinicIds.map((cid) => [
        cid,
        getClinicAppointments(cid).filter(/* thisMonth */).length,
      ])
    ),
  }
}
```

**Recharts visualization:**

```typescript
// app/(app)/groups/[groupId]/dashboard/page.tsx
export default function GroupDashboard({ params }: Props) {
  const metrics = getGroupMetrics(params.groupId)
  
  return (
    <ComposedChart data={[metrics]}>
      <Bar dataKey="clinic-001" fill="var(--clinic-primary-001)" />
      <Bar dataKey="clinic-002" fill="var(--clinic-primary-002)" />
    </ComposedChart>
  )
}
```

**Source:** Recharts 2.15.0 with multi-series charts; existing dashboard uses Recharts (app/dashboard/page.tsx imports from recharts).

### Anti-Patterns to Avoid

- **Global state in window object:** Don't store clinic ID in `window.currentClinicId`; use React Context instead.
- **Hardcoded clinic IDs in components:** Always read from context or route params; avoid if statements like `if (clinicId === 'clinic-001')`.
- **Mixed global and clinic data:** Don't have some patients at global scope and others clinic-scoped; all patients must have clinicId field.
- **Fetching all data, filtering in UI:** Mock data functions should filter; don't load 1000 patients and filter in React (scales poorly).
- **Color CSS-in-JS for every clinic:** Use CSS variables and Tailwind; avoid inline `style={{color: clinic.customHex}}` on every element.
- **Duplicate layouts for clinic vs. non-clinic pages:** Create one layout, conditionally render based on `params.clinicId`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State for current clinic | Custom hook with localStorage sync | React Context + `useClinicContext` hook | Context is built-in, pattern matches existing SidebarProvider; localStorage adds complexity and stale-state bugs |
| Multi-clinic data filtering | Custom filtering logic in every page | Partition functions in `mock-data.ts` (getClinicPatients, getClinicAppointments) | Centralized filtering ensures consistency; prevents inconsistent data visibility across pages |
| Clinic color theming | CSS-in-JS (styled-components, Emotion) | Tailwind CSS custom properties (oklch variables) | CSS variables are lighter-weight, zero-runtime overhead; existing globals.css already uses oklch |
| Group analytics aggregation | Manual map/reduce in dashboard component | `getGroupMetrics()` utility in mock-data.ts | Utility keeps logic testable and reusable; component stays focused on rendering |
| Clinic authorization | Manual clinicId checks in components | Future: middleware in Next.js or layout-level guards | Context is sufficient for MVP; layout can `throw notFound()` if clinicId not allowed |

**Key insight:** The existing MedConnect codebase already uses mock data functions (getTodayAppointments, getPatientAppointments) and context providers (SidebarProvider, TooltipProvider). Multi-clinic follows these patterns exactly.

## Runtime State Inventory

> This phase involves renaming/extending data model (adding Clinic, ClinicGroup), but NOT renaming existing fields or replacing patient/appointment data.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Mock data in lib/mock-data.ts: 5 patients, 23 appointments, 2 consultations, 4 medical attachments, 2 WhatsApp conversations — all will get `clinicId` field added | Code edit only: add `clinicId: string` to Patient, Appointment, ConsultationNote, MedicalAttachment interfaces; add test data for clinic-002 |
| Live service config | Mock data is in-memory only (arrays exported from lib/mock-data.ts) | None — no database/external store to migrate |
| OS-registered state | None — browser-only app with no OS registry | None |
| Secrets/env vars | None — no environment variables reference patient or clinic strings | None |
| Build artifacts | None — next build creates .next/ directory; no cached patient/appointment data | None |

**Action summary:** Add `clinicId: string` field to Patient, Appointment, ConsultationNote, and MedicalAttachment types. Update all test data instances to include clinicId. No data migration needed (mock data is reset on app restart).

## Common Pitfalls

### Pitfall 1: Clinic Context Changes Trigger Full Re-render
**What goes wrong:** Changing `currentClinicId` re-renders entire app (layout + all children). Switching clinics causes 500ms lag as React reconciles all components.

**Why it happens:** ClinicProvider wraps the entire app; any context value change triggers all consumers to re-render. If patients list has 100+ items and appointments list has 500+, React re-renders them all.

**How to avoid:** 
1. Memoize clinic context value: `const value = useMemo(() => ({ currentClinicId, ... }), [currentClinicId])`
2. Split context into two: one for read-only `clinics` list (never changes), one for `currentClinicId` (changes on switch)
3. Use `useCallback` for `setCurrentClinicId` to ensure referential stability

**Code:**
```typescript
// Good: split contexts
const ClinicListContext = createContext<Clinic[]>([]) // Read-only, memoized
const ClinicSelectionContext = createContext<{ currentId: string; setCurrentId: (id: string) => void }>()

// In provider:
const clinicListValue = useMemo(() => clinics, [clinics]) // Only changes if clinics array changes
const selectionValue = useMemo(() => ({ currentId, setCurrentId }), [currentId, setCurrentId])
```

**Warning signs:** Sidebar flickers when switching clinics; charts re-animate; form inputs lose focus when user selects a clinic.

### Pitfall 2: Clinic Color Variables Conflict with Tailwind Classes
**What goes wrong:** Custom CSS variable `--clinic-primary` doesn't apply because Tailwind's hard-coded color classes (e.g., `bg-teal-600`) override it.

**Why it happens:** Mixing Tailwind utility classes with CSS variable overrides; Tailwind classes have higher specificity.

**How to avoid:** Use arbitrary values in Tailwind: `bg-[oklch(var(--clinic-primary))]` instead of `bg-teal-600`. This delegates the value to the variable at runtime.

**Code:**
```typescript
// Bad: class won't apply clinic color
<div className="bg-teal-600"> 

// Good: CSS variable takes precedence via arbitrary value
<div style={{ '--clinic-primary': clinic.colorPalette.primary } as any} className="bg-[oklch(var(--clinic-primary))]">
```

**Warning signs:** Clinic colors don't change when switching clinics; header/sidebar always shows default teal.

### Pitfall 3: Route Params Accessed Before Context Set
**What goes wrong:** Page component tries to access `useClinicContext()` but layout hasn't set it yet because clinicId isn't in context state — only in route params.

**Why it happens:** Route params (`params.clinicId`) are available in layout/page but not automatically pushed to context; need manual sync in layout.

**How to avoid:** In `[clinicId]/layout.tsx`, extract `params.clinicId` and call `setCurrentClinicId(params.clinicId)` before rendering children.

**Code:**
```typescript
// app/(app)/clinics/[clinicId]/layout.tsx
export default function ClinicLayout({ children, params }: { children: ReactNode; params: { clinicId: string } }) {
  const { setCurrentClinicId } = useClinicContext()
  
  useEffect(() => {
    setCurrentClinicId(params.clinicId)
  }, [params.clinicId, setCurrentClinicId])

  return <>{children}</>
}
```

**Warning signs:** Page throws "useClinicContext must be used within ClinicProvider"; console shows undefined clinic.

### Pitfall 4: Mock Data Duplication Across Clinics
**What goes wrong:** Copy-pasting clinic-001's 5 patients to clinic-002 means updates in one clinic affect the shared object in both clinics.

**Why it happens:** JavaScript object references; if you do `const clinicsPatients = { 'clinic-001': patients, 'clinic-002': patients }`, both point to the same array.

**How to avoid:** Create separate data arrays for each clinic. Use a function to generate clinic-specific data.

**Code:**
```typescript
// Bad: shared reference
export const patients = [
  { id: 'pac-001', clinicId: 'clinic-001', nombre: 'Juan' },
  { id: 'pac-002', clinicId: 'clinic-002', nombre: 'Juan' }, // Mistake: same patient in both?
]

// Good: explicit clinic assignment
export const patients = [
  { id: 'pac-001', clinicId: 'clinic-001', nombre: 'Juan Carlos' },
  { id: 'pac-002', clinicId: 'clinic-001', nombre: 'Yolanda' },
  { id: 'pac-003', clinicId: 'clinic-002', nombre: 'Rafael' },
]

function getClinicPatients(clinicId: string): Patient[] {
  return patients.filter((p) => p.clinicId === clinicId) // Returns new array, no sharing
}
```

**Warning signs:** Updating patient in clinic-001 reflects in clinic-002; patient counts wrong across clinics.

### Pitfall 5: Group Dashboard Doesn't Update When Clinic Data Changes
**What goes wrong:** Group dashboard shows stale metrics because `getGroupMetrics()` is called once on page load; switching to a clinic and adding a patient doesn't update group metrics.

**Why it happens:** No reactive dependency; page renders once, metrics cached. Adding a patient in clinic-001 doesn't trigger group dashboard re-calculation.

**How to avoid:** Make group dashboard metrics depend on current clinic selection or use a key-based re-render trigger.

**Code:**
```typescript
// Good: use a key to force re-render when clinic changes
export default function GroupDashboard({ params }: Props) {
  const { currentClinicId } = useClinicContext()
  const metrics = getGroupMetrics(params.groupId)

  return (
    <div key={`group-${params.groupId}-${currentClinicId}`}>
      <ComposedChart data={[metrics]} />
    </div>
  )
}
```

**Warning signs:** Add a patient to clinic-001 via dashboard; switch to group dashboard; patient count doesn't increase.

## Code Examples

Verified patterns from existing codebase and React best practices:

### Example 1: Clinic Context Hook
```typescript
// Source: React 19 Context API; pattern matches existing SidebarProvider (components/ui/sidebar.tsx:45-54)
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import type { Clinic } from '@/lib/types'
import { clinics as mockClinics } from '@/lib/mock-data'

type ClinicContextProps = {
  currentClinicId: string | null
  currentClinic: Clinic | null
  clinics: Clinic[]
  setCurrentClinicId: (id: string) => void
}

const ClinicContext = createContext<ClinicContextProps | null>(null)

export function useClinicContext() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinicContext must be used within ClinicProvider')
  }
  return context
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [currentClinicId, setCurrentClinicId] = useState<string | null>('clinic-001')
  
  const currentClinic = mockClinics.find((c) => c.id === currentClinicId) || null
  
  const value = useMemo(
    () => ({
      currentClinicId,
      currentClinic,
      clinics: mockClinics,
      setCurrentClinicId,
    }),
    [currentClinicId]
  )

  return (
    <ClinicContext.Provider value={value}>
      {children}
    </ClinicContext.Provider>
  )
}
```

### Example 2: Clinic Data Filtering
```typescript
// Source: Existing pattern from lib/mock-data.ts (lines 804-827) extended to clinic scope
export function getClinicPatients(clinicId: string): Patient[] {
  return patients.filter((p) => p.clinicId === clinicId)
}

export function getClinicAppointments(clinicId: string): Appointment[] {
  return appointments.filter((apt) => {
    const patient = getPatientById(apt.pacienteId)
    return patient?.clinicId === clinicId
  })
}

export function getClinicTodayAppointments(clinicId: string): (Appointment & { paciente: Patient })[] {
  const todayStr = formatDate(new Date())
  return getClinicAppointments(clinicId)
    .map((apt) => ({ ...apt, paciente: getPatientById(apt.pacienteId)! }))
    .filter((apt) => apt.fecha === todayStr && apt.paciente)
}
```

### Example 3: Clinic Selector Component
```typescript
// Source: Radix UI dropdown pattern from existing app-sidebar.tsx (lines 206-251)
"use client"

import { useClinicContext } from '@/hooks/use-clinic-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, ChevronDown } from 'lucide-react'

export function ClinicSelector() {
  const { currentClinic, clinics, setCurrentClinicId } = useClinicContext()

  if (!currentClinic) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span>{currentClinic.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {clinics.map((clinic) => (
          <DropdownMenuItem
            key={clinic.id}
            onClick={() => setCurrentClinicId(clinic.id)}
            className={currentClinic.id === clinic.id ? 'bg-accent' : ''}
          >
            {clinic.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Example 4: Clinic Layout with Color Palette
```typescript
// Source: Tailwind CSS 4.2 custom properties; pattern extends existing globals.css oklch usage
'use client'

import { useClinicContext } from '@/hooks/use-clinic-context'
import { generateClinicCSSVariables } from '@/lib/theme-utils'

export default function ClinicLayout({ children, params }: { children: React.ReactNode; params: { clinicId: string } }) {
  const { currentClinic, setCurrentClinicId } = useClinicContext()

  useEffect(() => {
    setCurrentClinicId(params.clinicId)
  }, [params.clinicId, setCurrentClinicId])

  const cssVars = currentClinic
    ? (generateClinicCSSVariables(currentClinic.colorPalette) as React.CSSProperties)
    : {}

  return (
    <div style={cssVars}>
      <header className="bg-[oklch(var(--clinic-primary))] text-white p-4">
        <h1>{currentClinic?.name}</h1>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

### Example 5: Group Metrics Aggregation
```typescript
// Source: Functional data aggregation pattern; extends existing mock-data.ts helper functions
export function getGroupMetrics(groupId: string): GroupMetrics {
  const group = clinicGroups.find((g) => g.id === groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  const groupPatients = group.clinicIds.flatMap((cid) => getClinicPatients(cid))
  const groupAppointments = group.clinicIds.flatMap((cid) => getClinicAppointments(cid))

  const thisMonthAppointments = groupAppointments.filter(
    (apt) => new Date(apt.fecha).getMonth() === new Date().getMonth()
  )

  return {
    totalPatients: groupPatients.length,
    totalAppointments: groupAppointments.length,
    appointmentsThisMonth: thisMonthAppointments.length,
    completedAppointmentsThisMonth: thisMonthAppointments.filter(
      (apt) => apt.estado === 'completada'
    ).length,
    appointmentsByClinic: Object.fromEntries(
      group.clinicIds.map((cid) => [
        cid,
        getClinicAppointments(cid).filter(
          (apt) => new Date(apt.fecha).getMonth() === new Date().getMonth()
        ).length,
      ])
    ),
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single clinic global state | Multi-clinic via React Context | Designing this phase (2026) | Enables multi-tenant without Redux; follows React 19 best practices |
| Hard-coded Tailwind colors (e.g., `bg-teal-600`) | Clinic-specific CSS variables (oklch) + arbitrary Tailwind values | Tailwind CSS 4.0+ (Oct 2024) | Supports dynamic clinic branding; no CSS-in-JS needed |
| Manual data filtering in components | Centralized filtering in mock-data.ts | Established in existing codebase | Prevents inconsistencies; easier to test |
| Single dashboard for all users | Clinic-scoped + group-level dashboards | Part of this phase | Enables multi-level analytics and role-based views |

**Deprecated/outdated:**
- Redux for clinic state: Not needed; React Context is sufficient for single app-level concern
- CSS-in-JS for color theming: Tailwind CSS 4.2 variables are preferred; lighter-weight, zero runtime overhead

## Open Questions

1. **Authentication & Authorization:** How will clinics be assigned to users? Current codebase has mock auth (any credentials accepted). Should planner assume:
   - One user = one clinic (simplest)?
   - One user = multiple clinics in a group?
   - Requires future auth system?
   - **Recommendation:** Defer to future phase; assume context holds correct clinicId for current user.

2. **Persistent Clinic Selection:** Should clinic selection persist across sessions (localStorage/cookie)?
   - Current: Context resets to 'clinic-001' on refresh
   - **Recommendation:** Add localStorage sync to context `setCurrentClinicId`, similar to `SidebarProvider` cookie pattern (sidebar.tsx lines 85-86).

3. **Group Optional Flag:** Requirement says "groups are optional." Should single clinics show group-related UI (empty group selector)?
   - **Recommendation:** Group dashboard pages hidden if user has no groups; clinic pages always visible.

4. **Clinic Color Customization UI:** Full hex picker for every clinic, or constrained to 5 predefined palettes?
   - **Recommendation:** Start with 5 presets + one optional custom hex field for secondary color (simplest).

5. **Historical Data:** Should clinics have isolated appointment history, or shared? (E.g., if patient transfers clinics, do old appointments follow?)
   - **Recommendation:** Mock data: each patient has one clinicId (no transfers). Real implementation would handle this during migration.

## Environment Availability

**Step 2.6: SKIPPED** — This phase involves no external dependencies beyond the existing stack (React, Next.js, Tailwind, Recharts). All tools are already installed and verified in package.json. No databases, CLIs, runtimes, or external services required.

## Validation Architecture

**Test Framework**
| Property | Value |
|----------|-------|
| Framework | None configured (see Wave 0 gaps) |
| Config file | N/A — no test infrastructure |
| Quick run command | N/A |
| Full suite command | N/A |

**Phase Requirements → Test Map**

Assuming hypothetical requirements:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLINIC-01 | Clinic context provides currentClinicId | unit | `npm test -- context/clinic-context.test.ts` | ❌ Wave 0 |
| CLINIC-02 | Data filters by clinic ID correctly | unit | `npm test -- lib/mock-data.test.ts` | ❌ Wave 0 |
| CLINIC-03 | Clinic selector updates context | integration | `npm test -- components/clinic-selector.test.tsx` | ❌ Wave 0 |
| CLINIC-04 | Group metrics aggregate correctly | unit | `npm test -- lib/group-utils.test.ts` | ❌ Wave 0 |
| GROUP-01 | Group dashboard renders charts | integration | `npm test -- app/groups/[groupId]/dashboard.test.tsx` | ❌ Wave 0 |

**Sampling Rate**
- **Per task commit:** Not applicable (no test framework yet)
- **Per wave merge:** Manual verification (navigate to /clinics/clinic-001/dashboard, verify only clinic-001 data shown)
- **Phase gate:** Manual E2E walk-through before `/gsd-verify-work`

**Wave 0 Gaps**
- [ ] `jest.config.js` or `vitest.config.ts` — Test framework configuration
- [ ] `tests/setup.ts` — Test environment setup
- [ ] `tests/context/clinic-context.test.ts` — Test ClinicProvider memoization, context consumption
- [ ] `tests/lib/mock-data.test.ts` — Test clinic data filtering functions
- [ ] `tests/components/clinic-selector.test.tsx` — Test dropdown functionality
- [ ] `tests/lib/group-utils.test.ts` — Test metric aggregation
- [ ] Type tests: `tests/types.test.ts` — Validate Clinic, ClinicGroup interfaces

*(If test framework is added: run framework setup, then implement tests for each code example above.)*

## Sources

### Primary (HIGH confidence)
- **React 19 documentation** - Context API, hooks (useState, useCallback, useMemo)
- **Next.js 16 documentation** - Dynamic routes `[clinicId]`, layouts, params
- **Tailwind CSS 4.2 documentation** - CSS custom properties, oklch() color space, arbitrary values
- **Existing codebase** - SidebarProvider pattern (components/ui/sidebar.tsx:45-89), mock-data.ts functions (lib/mock-data.ts:804-867), AppSidebar component (components/app-sidebar.tsx:93-261)
- **Recharts 2.15.0 documentation** - Multi-series bar/line charts for group analytics

### Secondary (MEDIUM confidence)
- Package.json verified versions for React, Next.js, Tailwind CSS, Recharts (2026-03-25)
- Existing TypeScript config (tsconfig.json) confirms strict mode, path aliases
- Existing globals.css (app/globals.css:1-80) confirms oklch() variable usage

### Tertiary (Informational)
- React hooks best practices (memoization to prevent re-renders)
- CSS custom properties performance (zero runtime cost vs. CSS-in-JS)

## Metadata

**Confidence breakdown:**
- **Data model design:** HIGH (90%) - Existing codebase patterns clear, TypeScript types straightforward extension
- **State management (Context):** HIGH (95%) - React Context API is standard, SidebarProvider precedent in codebase
- **Sidebar navigation:** HIGH (85%) - Radix UI dropdown patterns established in app-sidebar.tsx
- **Data storage/partitioning:** HIGH (95%) - Mock data filtering functions already exist, pattern clear
- **Color palette system:** HIGH (85%) - Tailwind CSS 4.2 custom properties well-documented; existing globals.css uses oklch
- **URL routing strategy:** HIGH (90%) - Next.js 16 dynamic routes mature, codebase already uses `[id]` pattern
- **Group dashboard:** MEDIUM-HIGH (75%) - Recharts capabilities known, but exact metrics/visualizations depend on UI design phase

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable tech, no major updates expected in 30 days)

**Assumptions made:**
- No external database or API; mock data in lib/mock-data.ts
- Single user per session (no multi-user auth complexity)
- Clinic ownership/permissions deferred to future phase
- No offline support required
