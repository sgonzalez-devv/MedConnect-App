# Multi-Clinic Feature Implementation Roadmap

## Quick Summary

**Current State:** 50% complete
- Design system: fully implemented (57 components, OKLCH colors)
- Mock data: properly structured (2 clinics, 5 patients, 23 appointments)
- Clinic context: functional (but suboptimally used)
- Clinic-scoped pages: partially implemented (3 main pages done)

**Critical Issues:** 10 issues preventing production-ready multi-clinic support
- Global routes don't filter by clinic
- WhatsApp & Notifications lack clinic scoping
- Clinic colors not applied to UI
- Several routes missing clinic-scoped versions
- Route parameters not being used properly

---

## Priority 1: Data Structure (Critical - Must Do First)

### Issue 4.4 & 4.5: Add clinicId to WhatsAppConversation and Notification

**File:** `/lib/types.ts`

**Current:**
```typescript
export interface WhatsAppConversation {
  id: string
  pacienteId: string
  paciente?: Patient
  mensajes: WhatsAppMessage[]
  ultimaActualizacion: string
  estado: "activa" | "pendiente" | "resuelta"
  // ← Missing clinicId
}

export interface Notification {
  id: string
  tipo: "cita" | "mensaje" | "recordatorio" | "sistema"
  titulo: string
  mensaje: string
  timestamp: string
  leida: boolean
  accion?: { ... }
  // ← Missing clinicId
}
```

**Action:** Add `clinicId: string` field to both interfaces

**File:** `/lib/mock-data.ts`

**Actions:**
1. Add `clinicId` to all WhatsAppConversation mock data entries
   - All entries should reference either clinic-001 or clinic-002
2. Add `clinicId` to all Notification mock data entries
3. Add helper functions:
   ```typescript
   export function getClinicConversations(clinicId: string): WhatsAppConversation[]
   export function getClinicNotifications(clinicId: string): Notification[]
   ```

**Time Estimate:** 30 minutes

---

### Issue 4.6: Add clinic-scoped helper functions

**File:** `/lib/mock-data.ts`

**Add functions:**
```typescript
export function getClinicConsultationNotes(clinicId: string): ConsultationNote[]
export function getClinicMedicalAttachments(clinicId: string): MedicalAttachment[]
```

**Time Estimate:** 15 minutes

---

## Priority 2: Routing Architecture (High - Core Structure)

### Issue 4.2: Update clinic-scoped pages to use route params

**Files:**
- `/app/(app)/clinics/[clinicId]/dashboard/page.tsx`
- `/app/(app)/clinics/[clinicId]/pacientes/page.tsx`
- `/app/(app)/clinics/[clinicId]/calendario/page.tsx`

**Current Pattern (WRONG):**
```tsx
export default function ClinicDashboardPage() {
  const { currentClinicId } = useClinicContext()  // ← From context
  // ...
}
```

**New Pattern (CORRECT):**
```tsx
export default function ClinicDashboardPage({ 
  params }: { params: { clinicId: string } }) {
  const clinicId = params.clinicId  // ← From URL parameter
  const clinic = clinics.find(c => c.id === clinicId)
  // ...
}
```

**Time Estimate:** 1 hour (update 3 pages)

---

### Issue 4.8: Add missing clinic-scoped routes

**Create new pages:**
1. `/app/(app)/clinics/[clinicId]/bot-whatsapp/page.tsx`
   - Copy from `/bot-whatsapp/page.tsx`
   - Use `getClinicConversations(clinicId)` instead of global function
   - Add clinic name to header

2. `/app/(app)/clinics/[clinicId]/configuracion/page.tsx`
   - Copy from `/configuracion/page.tsx`
   - Add note that settings are clinic-specific
   
3. `/app/(app)/clinics/[clinicId]/pacientes/nuevo/page.tsx`
   - Copy from `/pacientes/nuevo/page.tsx`
   - Auto-set clinic to `params.clinicId` in form

4. `/app/(app)/clinics/[clinicId]/calendario/nueva-cita/page.tsx`
   - Copy from `/calendario/nueva-cita/page.tsx`
   - Auto-set clinic to `params.clinicId` in form
   - Filter patients by clinic

**Time Estimate:** 2-3 hours

---

### Issue 4.3: Update ClinicSelector to navigate

**File:** `/components/clinic-selector.tsx`

**Current:**
```tsx
onClick={() => setCurrentClinicId(clinic.id)}
```

**New:**
```tsx
onClick={() => {
  setCurrentClinicId(clinic.id)
  router.push(`/clinics/${clinic.id}/dashboard`)
}}
```

**Alternative:** In sidebar, update navigation items to include clinic context:
- Instead of `/dashboard`, use `/clinics/{clinicId}/dashboard`
- Dynamically build links based on current clinic

**Time Estimate:** 30 minutes

---

## Priority 3: Data Filtering (High - Critical UX)

### Issue 4.1: Global routes filter by clinic

**Files:**
- `/app/(app)/dashboard/page.tsx`
- `/app/(app)/pacientes/page.tsx`
- `/app/(app)/calendario/page.tsx`

**Option A: Filter using context**
```tsx
const { currentClinicId } = useClinicContext()
const todayAppointments = getClinicTodayAppointments(currentClinicId)
```

**Option B: Show all with clinic indicators**
```tsx
const appointments = getTodayAppointments()
// Show clinic name next to each appointment
// Add clinic selector dropdown at top
```

**Recommendation:** Option A is cleaner. If users need to see all clinics, they visit `/clinics` to select a view.

**Time Estimate:** 1 hour

---

## Priority 4: Theming & Visual Identity (Medium - UX Polish)

### Issue 4.7: Apply clinic colors to UI

**File:** `/app/(app)/clinics/layout.tsx`

Current setup applies CSS variables but they're not used. Two options:

**Option 1: Update Tailwind config**
- Expose `--clinic-primary` and `--clinic-accent` as Tailwind colors
- Allow `bg-clinic-primary`, `text-clinic-accent`, `border-clinic-primary` classes

**Option 2: Create CSS utility classes**
In `/styles/globals.css`:
```css
.clinic-primary {
  background-color: var(--clinic-primary);
}
.clinic-accent {
  color: var(--clinic-accent);
}
/* etc. */
```

**File:** Components that need theming
- Card (add clinic color border)
- Badge (use clinic colors for clinic-specific badges)
- Button primary (use clinic primary color)
- Sidebar accent (use clinic color)

**Example Update:**
```tsx
// Before:
<Card className="border-border">

// After:
<Card className="border-l-4" style={{ borderLeftColor: `var(--clinic-primary)` }}>
```

**Time Estimate:** 2-3 hours

---

## Priority 5: Data Integrity & Testing (Medium - Stability)

### Issue 4.10: Add clinic identity to global pages

**File:** All global route pages

**Add to each page header:**
```tsx
<div className="flex items-center gap-2 mb-4">
  <p className="text-muted-foreground">Viewing:</p>
  <ClinicSelector /> {/* Or a read-only display */}
</div>
```

**Time Estimate:** 30 minutes

---

### Create clinic isolation tests

**What to verify:**
1. clinic-001 only shows pac-001, pac-002 in patients list
2. clinic-002 only shows pac-003, pac-004, pac-005 in patients list
3. clinic-001 appointments (9 total) only show clinic-001's
4. clinic-002 appointments (14 total) only show clinic-002's
5. Group dashboard shows all 23 appointments (5+9+14)
6. Switching clinic in selector properly navigates and shows new clinic data

**Implementation:**
```typescript
// Manual test or automated:
import { getClinicPatients, getClinicAppointments } from '@/lib/mock-data'

console.assert(getClinicPatients('clinic-001').length === 2)
console.assert(getClinicPatients('clinic-002').length === 3)
console.assert(getClinicAppointments('clinic-001').length === 9)
console.assert(getClinicAppointments('clinic-002').length === 14)
```

**Time Estimate:** 1 hour

---

## Implementation Order (Recommended)

1. **Phase 1 - Foundation (2-3 hours)**
   - Add clinicId to WhatsAppConversation & Notification types
   - Update mock data with clinic assignments
   - Add clinic-scoped helper functions

2. **Phase 2 - Architecture (3-4 hours)**
   - Update clinic-scoped pages to use route params
   - Update ClinicSelector to navigate
   - Add global data filtering using context

3. **Phase 3 - Coverage (2-3 hours)**
   - Create 4 missing clinic-scoped route pages
   - Ensure all clinic-specific workflows work

4. **Phase 4 - Polish (2-3 hours)**
   - Apply clinic colors to UI components
   - Add clinic identity indicators to global pages

5. **Phase 5 - Testing (1 hour)**
   - Verify clinic data isolation
   - Test multi-clinic workflows
   - Group dashboard aggregation

**Total Time Estimate:** 11-16 hours
**Complexity:** Medium (architectural refactoring)

---

## Key Files to Modify

**Data Structure:**
- `/lib/types.ts` - Add clinicId to 2 interfaces
- `/lib/mock-data.ts` - Add clinicId to conversation/notification data, add 2 helper functions

**Routes & Navigation:**
- `/components/clinic-selector.tsx` - Add navigation
- `/app/(app)/clinics/[clinicId]/*/page.tsx` - Update 3 pages to use params
- Create 4 new clinic-scoped pages
- `/app/(app)/*/page.tsx` - Update 3 global pages to filter

**Styling:**
- `/app/(app)/clinics/layout.tsx` - Already set up, may need Tailwind config update
- Component files - Use clinic colors

**Testing:**
- Create test file or manual verification script

---

## Success Criteria

- [x] All data types have clinicId where needed
- [ ] Mock data has clinicId assigned to all records
- [ ] clinic-001 data isolated from clinic-002 data
- [ ] Switching clinics properly navigates and shows new data
- [ ] Clinic colors visually distinct in UI
- [ ] All CRUD operations clinic-aware (patient/appointment creation)
- [ ] Group dashboard aggregates across clinics correctly
- [ ] No cross-clinic data leakage
- [ ] All 4 missing routes implemented
- [ ] Tests pass verifying clinic isolation

---

## Notes & Considerations

1. **Context vs. Route Parameters:** Prefer route parameters for data selection, context for UI state
2. **Redirect Pattern:** Consider redirecting `/dashboard` → `/clinics/{selected-clinic}/dashboard`
3. **First Clinic:** Default to clinic-001 on first visit
4. **Error Handling:** Show error if clinicId in URL is invalid
5. **Performance:** No N+1 queries in mock data (already good)
6. **Testing:** Set up manual test flow for multi-clinic workflows

