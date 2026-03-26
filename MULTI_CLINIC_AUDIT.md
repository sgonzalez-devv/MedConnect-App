# MedConnect Multi-Clinic Feature Audit Report

**Date:** March 26, 2026  
**Project:** MedConnect Healthcare Application  
**Focus:** Multi-clinic feature implementation review

---

## 1. DESIGN SYSTEM & COMPONENTS

### 1.1 Color Palette Definition

**Location:** `/styles/globals.css`

The application uses OKLCH color space (modern, perceptually uniform) with these defined variables:

**Light Mode (default):**
- Background: `oklch(1 0 0)` - Pure white
- Foreground: `oklch(0.145 0 0)` - Near black
- Primary: `oklch(0.205 0 0)` - Dark gray
- Primary Foreground: `oklch(0.985 0 0)` - Near white
- Secondary: `oklch(0.97 0 0)` - Light gray
- Accent: `oklch(0.97 0 0)` - Light gray
- Destructive: `oklch(0.577 0.245 27.325)` - Red-orange
- Muted: `oklch(0.97 0 0)` - Light gray
- Muted Foreground: `oklch(0.556 0 0)` - Medium gray
- Border: `oklch(0.922 0 0)` - Very light gray
- Radius: `0.625rem` - Standard rounded corners

**Chart Colors:**
- Chart-1: `oklch(0.646 0.222 41.116)` - Orange
- Chart-2: `oklch(0.6 0.118 184.704)` - Blue
- Chart-3: `oklch(0.398 0.07 227.392)` - Dark blue
- Chart-4: `oklch(0.828 0.189 84.429)` - Yellow-green
- Chart-5: `oklch(0.769 0.188 70.08)` - Orange-yellow

**Sidebar Colors:**
- Sidebar: `oklch(0.985 0 0)` - Off-white
- Sidebar Primary: `oklch(0.205 0 0)` - Dark gray
- Sidebar Accent: `oklch(0.97 0 0)` - Light gray

**Clinic-Specific Colors** (defined in `lib/theme-utils.ts`):
Located in `/lib/theme-utils.ts` - Preset color palettes using OKLCH:
- **Teal**: primary `oklch(0.52 0.18 181)`, accent `oklch(0.70 0.19 163)`
- **Blue**: primary `oklch(0.49 0.13 263)`, accent `oklch(0.61 0.19 255)`
- **Indigo**: primary `oklch(0.43 0.17 280)`, accent `oklch(0.60 0.13 286)`
- **Green**: primary `oklch(0.51 0.17 142)`, accent `oklch(0.68 0.18 135)`
- **Purple**: primary `oklch(0.49 0.18 308)`, accent `oklch(0.65 0.22 305)`

Applied via CSS variables: `--clinic-primary` and `--clinic-accent`

### 1.2 Component Library Inventory

**Location:** `/components/ui/` (57 components)

**Core Components Available:**

**Layout & Structure:**
- Card (Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter)
- Sidebar (with SidebarProvider, SidebarInset, SidebarTrigger, etc.)
- Separator

**Input Components:**
- Button (variants: default, destructive, outline, secondary, ghost, link | sizes: default, sm, lg, icon, icon-sm, icon-lg)
- Input
- Textarea
- Checkbox
- Radio Group
- Select
- Toggle / Toggle Group
- Slider

**Data Display:**
- Table (TableHeader, TableBody, TableRow, TableCell, etc.)
- Badge (variants: default, secondary, destructive, outline)
- Avatar (Avatar, AvatarImage, AvatarFallback)
- Progress
- Pagination
- Calendar
- Carousel

**Feedback & Modals:**
- Alert / Alert Dialog
- Dialog
- Drawer
- Popover
- Tooltip (with TooltipProvider, TooltipTrigger, TooltipContent)
- Toast / Toaster (via Sonner)
- Spinner

**Navigation:**
- Breadcrumb
- Command (searchable menu)
- Context Menu
- Dropdown Menu
- Navigation Menu
- Menubar

**Form:**
- Form (React Hook Form integration)
- Label
- Field
- Input Group

**Utility:**
- Skeleton
- Scroll Area
- Hover Card
- Collapsible
- Accordion
- Aspect Ratio
- KBD
- Empty

### 1.3 Component Usage in Existing Pages

**Button Variants Used:**
- `variant="default"` - Primary action buttons
- `variant="outline"` - Secondary action buttons  
- `variant="ghost"` - Tertiary/minimal buttons
- `variant="link"` - Text link buttons
- Sizes: default, sm, lg, icon

**Badge Variants Used:**
- `variant="default"` - Primary badges
- `variant="secondary"` - Status badges
- `variant="outline"` - Optional badges
- Custom styling with className for specific colors

**Card Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Avatar Usage:**
- Default size: 32px (h-8 w-8)
- Large size: 40px (h-10 w-10)
- With fallback initials from patient names

**Example Pages:**
- `/dashboard` - Uses Card, Badge, Avatar, Button, Tooltip
- `/pacientes` - Uses Table, Badge, Avatar, Button, Dropdown Menu
- `/calendario` - Uses Card, Badge, Button, Calendar
- `/clinics/[clinicId]/dashboard` - Clinic-scoped version of dashboard

---

## 2. CURRENT MOCK DATA STRUCTURE

**Location:** `/lib/mock-data.ts`

### 2.1 Clinics Data

```typescript
clinics: Clinic[] = [
  {
    id: 'clinic-001',
    name: 'Clínica Central',
    location: 'Santo Domingo',
    email: 'central@clinic.com',
    telefono: '+1 809 555 0001',
    colorPalette: { id: 'palette-001', presetName: 'teal' }
  },
  {
    id: 'clinic-002',
    name: 'Clínica Naco',
    location: 'Santo Domingo',
    email: 'naco@clinic.com',
    telefono: '+1 809 555 0002',
    colorPalette: { id: 'palette-002', presetName: 'blue' }
  }
]
```

### 2.2 Patient Distribution by Clinic

**Clinic-001 (Clínica Central): 2 patients**
- pac-001: Juan Carlos Rodríguez Marte
- pac-002: Yolanda De los Santos Mejía

**Clinic-002 (Clínica Naco): 3 patients**
- pac-003: Rafael Antonio Peña Bautista
- pac-004: Mercedes Altagracia Familia Núñez
- pac-005: José Miguel Taveras Polanco

**Total:** 5 patients across 2 clinics

### 2.3 Appointment Distribution by Clinic

**Clinic-001: 9 appointments**
- cita-001, cita-002, cita-009, cita-010 (today/recent)
- cita-006, cita-007 (past/completed)
- cita-013, cita-019, cita-022 (future)

**Clinic-002: 14 appointments**
- cita-003, cita-004, cita-008 (today/recent)
- cita-005, cita-011, cita-012, cita-020, cita-021, cita-023 (future)
- cita-015, cita-016, cita-017, cita-018 (past/various states)

**Total:** 23 appointments across both clinics
**Today's appointments:** 7 total (clinic-001: 3, clinic-002: 4)

### 2.4 Clinic-Scoped Data Access Functions

**Location:** `/lib/mock-data.ts` (lines 875-932)

```typescript
// Filters patients by clinicId
getClinicPatients(clinicId: string): Patient[]

// Filters appointments by clinicId
getClinicAppointments(clinicId: string): Appointment[]

// Returns today's appointments with patient data for a specific clinic
getClinicTodayAppointments(clinicId: string): (Appointment & { paciente: Patient })[]

// Returns metrics for a clinic group
getGroupMetrics(groupId: string): GroupMetrics
```

**Verification Status:** ✓ WORKING
- Functions properly filter data by `clinicId` field
- All patients and appointments have `clinicId` set
- No missing clinic assignments

### 2.5 Clinic Groups

**Location:** `/lib/mock-data.ts` (lines 56-64)

```typescript
clinicGroups: ClinicGroup[] = [
  {
    id: 'group-001',
    name: 'Grupo Central & Naco',
    clinicIds: ['clinic-001', 'clinic-002'],
    createdAt: '2024-01-01',
    ownerId: 'owner-001'
  }
]
```

One group containing both clinics.

---

## 3. CURRENT PAGES STRUCTURE & ROUTING

### 3.1 Page Hierarchy

```
app/(app)/
├── dashboard/
│   └── page.tsx (Global dashboard - shows ALL clinics data)
├── pacientes/
│   ├── page.tsx (Global patients - shows ALL clinics)
│   ├── [id]/page.tsx (Patient detail)
│   └── nuevo/page.tsx (New patient - no clinic scoping)
├── calendario/
│   ├── page.tsx (Global appointments - shows ALL clinics)
│   ├── nueva-cita/page.tsx (New appointment - no clinic scoping)
│   └── cita/[id]/page.tsx (Appointment detail)
├── bot-whatsapp/
│   └── page.tsx (WhatsApp conversations - global)
├── configuracion/
│   └── page.tsx (Settings - global)
├── clinics/
│   ├── page.tsx (Clinic selector/list)
│   ├── layout.tsx (Clinic context & CSS variables)
│   └── [clinicId]/
│       ├── dashboard/
│       │   └── page.tsx (Clinic-specific dashboard)
│       ├── pacientes/
│       │   └── page.tsx (Clinic-specific patients)
│       └── calendario/
│           └── page.tsx (Clinic-specific appointments)
├── groups/
│   ├── page.tsx (Group list)
│   └── [groupId]/
│       └── dashboard/
│           └── page.tsx (Group analytics dashboard)
├── layout.tsx (App layout with ClinicProvider wrapper)
```

### 3.2 Current Routing Patterns

**Global Routes (show all clinics):**
- `/dashboard` - Summary of all clinics
- `/pacientes` - All patients across all clinics
- `/calendario` - All appointments across all clinics
- `/bot-whatsapp` - All conversations
- `/configuracion` - Settings

**Clinic-Scoped Routes (use context):**
- `/clinics/[clinicId]/dashboard` - Clinic-specific dashboard
- `/clinics/[clinicId]/pacientes` - Clinic-specific patient list
- `/clinics/[clinicId]/calendario` - Clinic-specific appointment calendar

**Group Routes:**
- `/groups` - List of clinic groups
- `/groups/[groupId]/dashboard` - Multi-clinic analytics

**Clinic Selector:**
- `/clinics` - Clinic selection/overview page

### 3.3 Context Usage Pattern

**ClinicProvider:** Wraps entire app at `/app/(app)/layout.tsx`

**useClinicContext() Hook:** Used in clinic-scoped pages to:
1. Get `currentClinicId` - passed to URL parameter
2. Get `currentClinic` - for clinic name display
3. Access `clinics` array - for dropdown selector
4. Call `setCurrentClinicId()` - to change clinic

**Problem:** Clinic-scoped pages rely on URL parameter `[clinicId]` from layout AND context. Layout updates context when URL changes (side effect in useEffect).

---

## 4. ISSUES & PROBLEMS IDENTIFIED

### 4.1 ISSUE: Global Routes Mix All Clinic Data

**Location:**
- `/app/(app)/dashboard/page.tsx`
- `/app/(app)/pacientes/page.tsx`
- `/app/(app)/calendario/page.tsx`

**Problem:** These pages use global mock data functions without clinic filtering:
- `getTodayAppointments()` - returns ALL clinics' appointments
- `patients` - shows ALL patients
- `getAppointmentsWithPatients()` - ALL appointments

**Code Example:**
```tsx
// Line 42 in /dashboard/page.tsx
const todayAppointments = getTodayAppointments()  // ← No clinic filtering
const unreadNotifications = notifications.filter((n) => !n.leida)
const activeConversations = getConversationsWithPatients()
```

**Impact:** 
- Users see a mixed view of all clinics
- Cannot isolate data per clinic
- Confusion between clinics in global view

**Recommendation:** Either:
1. Add clinic filtering to these pages using context
2. Redirect global pages to clinic-scoped versions
3. Add clinic filter UI to global pages

### 4.2 ISSUE: Clinic-Scoped Pages Use Context Instead of Route Parameter

**Location:**
- `/app/(app)/clinics/[clinicId]/dashboard/page.tsx`
- `/app/(app)/clinics/[clinicId]/pacientes/page.tsx`
- `/app/(app)/clinics/[clinicId]/calendario/page.tsx`

**Problem:** These pages get `currentClinicId` from context (which is updated by layout), not from the route parameter. This creates dependency on:
1. Layout side effect that updates context
2. Context value synchronization with URL

**Code Example:**
```tsx
// Line 42 in /clinics/[clinicId]/dashboard/page.tsx
const { currentClinic, currentClinicId } = useClinicContext()
// currentClinicId comes from context, not params
```

**Better Approach:**
```tsx
export default function ClinicDashboardPage({ 
  params }: { params: { clinicId: string } }) {
  const clinicId = params.clinicId  // ← Use route parameter directly
  // Then fetch clinic from clinics array by ID
}
```

**Impact:** 
- Coupling between context and route parameter
- Requires layout side effect to work
- Harder to test and reason about

### 4.3 ISSUE: ClinicSelector Component Location & Absence

**Location:** `/components/clinic-selector.tsx`

**Current State:** 
- Component exists and is properly implemented
- Used in sidebar at `/components/app-sidebar.tsx` (not visible in excerpt but referenced as import)
- Works with context to switch clinics

**Problem:** 
- Not clear if selector is visible in UI
- Sidebar navigation items still use global routes (`/dashboard`, `/pacientes`, `/calendario`)
- Switching clinic in selector doesn't redirect to clinic-scoped routes

**Code Issues:**
```tsx
// In clinic-selector.tsx, line 31
setCurrentClinicId(clinic.id)  // ← Only updates context, doesn't navigate
```

**Recommendation:**
- Add navigation to clinic-scoped routes when clinic is selected
- Or update sidebar navigation to include clinic context

### 4.4 ISSUE: WhatsApp Data Not Clinic-Scoped

**Location:** `/lib/mock-data.ts` (lines 535-615)

**Problem:** `WhatsAppConversation` interface does NOT have `clinicId` field
```typescript
export interface WhatsAppConversation {
  id: string
  pacienteId: string
  paciente?: Patient
  mensajes: WhatsAppMessage[]
  ultimaActualizacion: string
  estado: "activa" | "pendiente" | "resuelta"
  // ← Missing clinicId field
}
```

**Impact:**
- WhatsApp conversations shown globally without clinic filtering
- Cannot determine which clinic a conversation belongs to
- Multi-clinic setup won't isolate conversations

**Recommendation:** Add `clinicId` field to WhatsAppConversation type

### 4.5 ISSUE: Notification Data Not Clinic-Scoped

**Location:** `/lib/mock-data.ts` (lines 617-682)

**Problem:** `Notification` interface does NOT have `clinicId` field
```typescript
export interface Notification {
  id: string
  tipo: "cita" | "mensaje" | "recordatorio" | "sistema"
  titulo: string
  mensaje: string
  timestamp: string
  leida: boolean
  accion?: { ... }
  // ← Missing clinicId field
}
```

**Impact:**
- Notifications shown globally
- Cannot filter notifications by clinic
- Same notifications for all users regardless of clinic

**Recommendation:** Add `clinicId` field to Notification type

### 4.6 ISSUE: ConsultationNote & MedicalAttachment Have clinicId But Not Fully Utilized

**Location:** `/lib/mock-data.ts`

**Current State:**
```typescript
export interface ConsultationNote {
  id: string
  clinicId: string  // ✓ Has clinic reference
  ...
}

export interface MedicalAttachment {
  id: string
  clinicId: string  // ✓ Has clinic reference
  ...
}
```

**Problem:** No helper functions to filter these by clinic
```typescript
// ✗ Missing:
export function getClinicConsultationNotes(clinicId: string): ConsultationNote[]
export function getClinicMedicalAttachments(clinicId: string): MedicalAttachment[]
```

**Impact:** 
- Medical records scattered when accessed clinically
- Potential data leakage between clinics if not handled carefully

**Recommendation:** Add clinic-scoped helper functions

### 4.7 ISSUE: Theme Colors Not Actually Applied to UI

**Location:** `/app/(app)/clinics/layout.tsx`

**Current Implementation:**
```typescript
const cssVars = currentClinic
  ? (generateClinicCSSVariables(currentClinic.colorPalette) as React.CSSProperties)
  : {}

return (
  <div style={cssVars}>
    {children}
  </div>
)
```

**Problem:**
- CSS variables are set but NOT used in components
- Components use hardcoded color classes (e.g., `text-teal-600`, `bg-blue-50`)
- `--clinic-primary` and `--clinic-accent` variables are never referenced in CSS

**Impact:**
- Clinic colors not visually distinct in UI
- Color theming feature is non-functional
- Users cannot distinguish between clinics visually

**Example:** In `/clinics/page.tsx` line 37:
```tsx
style={{
  backgroundColor: clinic.colorPalette.customSecondaryHex || "oklch(0.70 0.19 163)"
}}
// ← Hardcoded fallback, not using defined theme
```

**Recommendation:**
1. Add CSS class definitions for `var(--clinic-primary)` and `var(--clinic-accent)`
2. Update components to use these variables
3. Or update Tailwind config to expose these as color utilities

### 4.8 ISSUE: Routes Missing Clinic-Scoped Versions

**Location:** Route structure

**Missing Clinic-Scoped Routes:**
- `/clinics/[clinicId]/bot-whatsapp` - WhatsApp conversations
- `/clinics/[clinicId]/configuracion` - Settings
- `/clinics/[clinicId]/pacientes/nuevo` - New patient (should auto-assign clinic)
- `/clinics/[clinicId]/calendario/nueva-cita` - New appointment (should auto-assign clinic)

**Impact:**
- New patient/appointment creation not clinic-aware
- Settings and communications are global
- Cannot manage clinic-specific settings

### 4.9 ISSUE: Groups Dashboard Only Shows Metrics, No Detailed Data

**Location:** `/app/(app)/groups/[groupId]/dashboard/page.tsx`

**Problem:**
- Shows aggregate metrics only
- No detailed patient list, appointment calendar, or management features
- Uses `getGroupMetrics()` which returns counts, not detailed records

**Impact:**
- Group view is limited to analytics only
- Cannot manage patients or appointments at group level

### 4.10 ISSUE: No Clinic Identity/Branding in Global Pages

**Location:** Global routes (`/dashboard`, `/pacientes`, `/calendario`)

**Problem:**
- No indication which clinic data is being viewed
- No clinic selector visible on global pages
- User confusion about data context

**Impact:**
- Poor UX for multi-clinic users
- Unclear data provenance

---

## 5. CURRENT STATE ASSESSMENT

### What's Working Well ✓

1. **Type System:** All data types properly include `clinicId` fields (where needed)
2. **Clinic-Scoped Functions:** `getClinicPatients()`, `getClinicAppointments()`, `getClinicTodayAppointments()` work correctly
3. **Mock Data Structure:** Properly distributed across 2 clinics with 5 patients, 23 appointments
4. **Clinic Context:** ClinicProvider and useClinicContext work for managing current clinic selection
5. **Clinic Layout:** Layout pattern established with CSS variable application (though colors not used)
6. **ClinicSelector Component:** Properly implemented, can switch clinic selection
7. **Design System:** Comprehensive UI component library with consistent styling
8. **Group Metrics:** getGroupMetrics() correctly aggregates data across clinic groups

### What Needs Fixing ✗

1. **Global Routes Mix Data:** /dashboard, /pacientes, /calendario don't filter by clinic
2. **WhatsApp & Notifications Not Clinic-Scoped:** Missing clinicId fields
3. **Clinic Colors Not Applied:** CSS variables defined but not used in UI
4. **Route Parameters Not Used:** Clinic-scoped pages rely on context instead of route params
5. **Missing Helper Functions:** No clinic-scoped access for consultation notes, attachments
6. **Incomplete Route Coverage:** Missing clinic-scoped versions of several features
7. **Clinic Selector Doesn't Navigate:** Only updates context, doesn't redirect to clinic routes
8. **Groups Dashboard Limited:** Only shows metrics, not detailed management

---

## 6. RECOMMENDATIONS FOR MULTI-CLINIC REBUILD

### Phase 1: Data Structure (Foundation)

1. **Add clinicId to WhatsAppConversation interface**
   - Add to mock data
   - Add filter function: `getClinicConversations(clinicId)`

2. **Add clinicId to Notification interface**
   - Add to mock data
   - Add filter function: `getClinicNotifications(clinicId)`

3. **Add clinic-scoped helper functions**
   - `getClinicConsultationNotes(clinicId)`
   - `getClinicMedicalAttachments(clinicId)`

### Phase 2: Routing & Navigation (Structure)

1. **Update clinic-scoped pages to use route parameters**
   - Don't rely on context, use `params.clinicId` directly
   - Keep context for UI state (selector) only

2. **Add missing clinic-scoped routes**
   - Create `/clinics/[clinicId]/bot-whatsapp/page.tsx`
   - Create `/clinics/[clinicId]/configuracion/page.tsx`
   - Create `/clinics/[clinicId]/pacientes/nuevo/page.tsx`
   - Create `/clinics/[clinicId]/calendario/nueva-cita/page.tsx`

3. **Update ClinicSelector to navigate**
   - When clinic is selected, navigate to `/clinics/{clinicId}/dashboard`
   - Or use router.push() to navigate to clinic route

4. **Add global clinic filter UI**
   - Add clinic selector to global pages
   - Filter data using selected clinic from dropdown

### Phase 3: Theming (Visual Identity)

1. **Create Tailwind config for clinic colors**
   - Expose `--clinic-primary` and `--clinic-accent` as utilities
   - Allow `bg-clinic-primary`, `text-clinic-accent`, etc.

2. **Update components to use clinic colors**
   - Replace hardcoded colors with clinic theme variables
   - Update Card, Button, Badge styling for each clinic

3. **Add visual indicators for clinic context**
   - Show clinic name in header
   - Show clinic color in sidebar
   - Color-code patient/appointment by clinic

### Phase 4: Data Integrity (Validation)

1. **Add clinic context checks**
   - Validate patient belongs to clinic before operations
   - Prevent cross-clinic data access

2. **Test clinic isolation**
   - Verify clinic-001 only shows clinic-001 patients
   - Verify clinic-002 only shows clinic-002 patients
   - Test group dashboards with both clinics

3. **Add data consistency validation**
   - All patients, appointments must have valid clinicId
   - All clinicIds must reference existing clinic

---

## 7. COMPONENT USAGE EXAMPLES

### Button Variants Available:
```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Badge Variants Available:
```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Card Structure:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>
```

### Avatar Usage:
```tsx
<Avatar>
  <AvatarImage src="..." />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

## 8. FILE LOCATIONS SUMMARY

### Core Files
- **Design System:** `/styles/globals.css`
- **Theme Utilities:** `/lib/theme-utils.ts`
- **Mock Data:** `/lib/mock-data.ts`
- **Type Definitions:** `/lib/types.ts`
- **Clinic Context:** `/context/clinic-context.tsx`
- **Clinic Hook:** `/hooks/use-clinic-context.ts`

### Components
- **ClinicSelector:** `/components/clinic-selector.tsx`
- **AppointmentCard:** `/components/appointment-card.tsx`
- **StatsCard:** `/components/stats-card.tsx`
- **AppSidebar:** `/components/app-sidebar.tsx`
- **UI Components:** `/components/ui/` (57 components)

### Pages - Global Routes
- **Dashboard:** `/app/(app)/dashboard/page.tsx`
- **Patients:** `/app/(app)/pacientes/page.tsx`
- **Calendar:** `/app/(app)/calendario/page.tsx`
- **WhatsApp:** `/app/(app)/bot-whatsapp/page.tsx`
- **Settings:** `/app/(app)/configuracion/page.tsx`

### Pages - Clinic-Scoped Routes
- **Clinic List:** `/app/(app)/clinics/page.tsx`
- **Clinic Layout:** `/app/(app)/clinics/layout.tsx`
- **Clinic Dashboard:** `/app/(app)/clinics/[clinicId]/dashboard/page.tsx`
- **Clinic Patients:** `/app/(app)/clinics/[clinicId]/pacientes/page.tsx`
- **Clinic Calendar:** `/app/(app)/clinics/[clinicId]/calendario/page.tsx`

### Pages - Group Routes
- **Groups List:** `/app/(app)/groups/page.tsx`
- **Group Dashboard:** `/app/(app)/groups/[groupId]/dashboard/page.tsx`

### Layout
- **App Layout:** `/app/(app)/layout.tsx`
- **Root Layout:** `/app/layout.tsx`

---

## 9. DATA DISTRIBUTION TABLE

### Patients by Clinic
| Clinic ID | Clinic Name | Patient Count | Patient IDs |
|-----------|------------|---|---|
| clinic-001 | Clínica Central | 2 | pac-001, pac-002 |
| clinic-002 | Clínica Naco | 3 | pac-003, pac-004, pac-005 |
| **TOTAL** | | **5** | |

### Appointments by Clinic
| Clinic ID | Total | Today | Confirmed | Completed |
|-----------|-------|-------|-----------|-----------|
| clinic-001 | 9 | 3 | 2 | 2 |
| clinic-002 | 14 | 4 | 3 | 3 |
| **TOTAL** | **23** | **7** | **5** | **5** |

### Clinic Configuration
| Clinic ID | Name | Location | Color Preset | Primary OKLCH | Accent OKLCH |
|-----------|------|----------|---|---|---|
| clinic-001 | Clínica Central | Santo Domingo | teal | oklch(0.52 0.18 181) | oklch(0.70 0.19 163) |
| clinic-002 | Clínica Naco | Santo Domingo | blue | oklch(0.49 0.13 263) | oklch(0.61 0.19 255) |

---

**End of Audit Report**
