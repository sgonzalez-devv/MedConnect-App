# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Runner:** Not detected

**Assertion Library:** Not detected

**Test Configuration Files:** No test framework configuration found (`jest.config.*`, `vitest.config.*`, etc.)

**Current Status:** No automated testing infrastructure present in codebase

**Run Commands:** 
```bash
npm run lint              # Run ESLint code quality checks
npm run dev               # Development server
npm run build             # Production build
npm run start             # Production server start
```

## Test File Organization

**Location Pattern:** Not applicable - no test files present

**Naming Convention:** Not established

**Test Discovery:** No test files found (no `*.test.*` or `*.spec.*` files in source directories)

**Note:** Dependencies include testing-capable libraries (zod for validation, react-hook-form for form handling) but no test configuration exists.

## Test Structure

**Framework Status:** Not configured

**Unit Tests:** Not implemented

**Integration Tests:** Not implemented

**E2E Tests:** Not configured

**Current Approach:** Manual testing and development-time validation through TypeScript type checking

## Mocking Strategy

**Mocking Framework:** Not configured

**Current Mock Implementation:** 
- **Location:** `lib/mock-data.ts` (867 lines)
- **Purpose:** Provides fixture data for development and demos
- **Pattern:** Centralized mock data exports for use in page components

**Mock Data Pattern (from `lib/mock-data.ts`):**
```typescript
import type {
  Patient,
  Appointment,
  ConsultationNote,
  MedicalAttachment,
  WhatsAppConversation,
  Notification,
  DoctorProfile,
  VitalSigns,
  MedicalHistory,
  Vaccine,
} from "./types"

export const doctorProfile: DoctorProfile = {
  id: "doc-001",
  nombre: "Dra. Carmen Altagracia Pérez",
  especialidad: "Medicina General",
  // ... properties
}

export const patients: Patient[] = [
  { id: "pac-001", nombre: "Juan Carlos", ... },
  // ... more patient records
]

export const appointments: Appointment[] = [
  // ... appointment records
]

// Helper functions for mock data
export function getTodayAppointments(): Appointment[] {
  // Returns today's appointments
}

export function getConversationsWithPatients(): WhatsAppConversation[] {
  // Returns patient conversations
}

export function getUnreadNotificationsCount(): number {
  // Returns count of unread notifications
}
```

**What to Mock:**
- All API/backend calls would use mock data during development
- External service integrations (WhatsApp Bot, email, notifications)

**What NOT to Mock:**
- Component rendering logic
- User interactions
- TypeScript type checking

## Fixtures and Factories

**Test Data Location:** `lib/mock-data.ts`

**Pattern:**
```typescript
// Direct export of typed data structures
export const doctorProfile: DoctorProfile = { /* ... */ }
export const patients: Patient[] = [ /* ... */ ]
export const appointments: Appointment[] = [ /* ... */ ]
export const notifications: Notification[] = [ /* ... */ ]
export const conversations: WhatsAppConversation[] = [ /* ... */ ]

// Factory-like functions for computed data
export function getTodayAppointments(): Appointment[] {
  const today = new Date()
  // compute and return today's appointments
}
```

**Data Consistency:**
- Mock doctor: Dra. Carmen Altagracia Pérez (ID: doc-001)
- 5 sample patients with realistic Dominican names and data
- Pre-generated appointments, consultations, and conversation records
- Timestamps and dates use realistic values

## Coverage

**Coverage Requirements:** None enforced

**Current Coverage:** 0% - No test suite present

**Type Coverage:** High - TypeScript strict mode enables type-level safety

## Quality Checks

**Linting Configuration:**
- **ESLint:** Configured and enabled
- **Run Command:** `npm run lint` (eslint .)
- **No explicit .eslintrc:** Uses Next.js default ESLint configuration

**Code Formatting:**
- **Prettier:** Not explicitly configured (no `.prettierrc` file found)
- **Formatting:** Code follows consistent style with 2-space indentation and single quotes

**Type Checking:**
- **TypeScript:** Enabled with strict mode
- **Version:** 5.7.3
- **Strictness:** `"strict": true` in tsconfig.json
- **Build Errors:** `typescript.ignoreBuildErrors: true` in next.config.mjs allows build to proceed despite type errors
- **Type Validation:** JSDoc and interface-based type checking

**Build Quality:**
- **TypeScript Compilation:** Part of build process
- **Build Script:** `npm run build` (next build)

## Test Types and Scope

**Unit Tests:** Not implemented

**Integration Tests:** Not implemented

**E2E Tests:** Not configured

**Manual Testing Approach:**
- Development via `npm run dev` for manual testing
- Mock data used throughout for realistic workflow testing
- Component behavior validated through visual inspection and browser interaction

## Validation Patterns

**Form Validation:** 
- **Library:** `react-hook-form` (7.54.1) for form handling
- **Schema Validation:** `zod` (3.24.1) for runtime schema validation
- **HTML5 Validation:** Native HTML5 validation attributes used (e.g., `required` attribute)

**Form Pattern (from `app/onboarding/page.tsx`):**
```typescript
const [formData, setFormData] = useState({
  nombreConsultorio: "",
  especialidad: "",
  direccion: "",
  telefono: "",
  horarioInicio: "09:00",
  horarioFin: "18:00",
  duracionCita: "30",
})

// Change handler with state update
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
```

**Type-Based Validation:**
- Strong typing through interfaces ensures correct data shapes
- TypeScript prevents runtime type errors

## Testing Best Practices Not Yet Implemented

**Recommended Additions:**

1. **Unit Test Framework Setup:**
   - Install and configure Vitest or Jest
   - Target coverage: 80%+ for business logic

2. **Component Testing:**
   - Use `@testing-library/react` for component testing
   - Test user interactions and state changes

3. **Integration Tests:**
   - Test data flow between components
   - Test hook integration with components

4. **E2E Testing:**
   - Use Playwright or Cypress for full user workflows
   - Test critical paths: login, create appointment, patient management

5. **Type Testing:**
   - Use `ts-expect-error` for testing type narrowing

## Testing Gaps

**Untested Areas:**
- **All Components:** No unit tests for UI components - `components/` directory
- **All Pages:** No page component tests - `app/*/page.tsx` files
- **All Hooks:** No hook tests - `hooks/` directory
- **Utility Functions:** No tests for `lib/date-utils.ts`, `lib/utils.ts` functions
- **Type Safety:** No type-level tests (e.g., no test to verify union types are exhaustively handled)

**Risk Areas:**
- **Date Formatting:** `date-utils.ts` has critical formatting functions with no tests
  - Functions: `formatDateLong()`, `formatDateWithWeekday()`, `formatDateShort()`, `calculateAge()`
  - Risk: Date formatting errors would break medical record accuracy
  
- **Component Rendering:** No tests to catch rendering regressions
  - Critical components: `DashboardPage`, `AppointmentCard`, `StatsCard`
  - Risk: UI bugs could impact user experience

- **Form Validation:** No tests for form submission and validation logic
  - Critical forms: Login, Onboarding, Appointment creation
  - Risk: Invalid data could be processed

- **Type Contracts:** No tests verifying types are correctly enforced
  - All medical record types (`Patient`, `Appointment`, `VitalSigns`) lack validation tests
  - Risk: Runtime type violations could cause crashes

**Priority for Implementation:**
- High: Date utility functions (used throughout app)
- High: Medical type validation (ensures data integrity)
- Medium: Component snapshot and interaction tests
- Medium: Form validation tests
- Low: UI integration tests (heavy refactoring potential)

## CI/CD Testing Automation

**Current CI/CD:** No CI/CD pipeline detected in codebase

**Build Automation:** 
- Next.js build process runs TypeScript compilation
- Type errors can be ignored via `typescript.ignoreBuildErrors: true` setting

**Pre-commit Hooks:** Not configured (no husky, lint-staged, or pre-commit configuration)

**Deployment Testing:** Manual testing before deployment (no automated gates)

## Code Quality Tools Summary

| Tool | Status | Config File | Purpose |
|------|--------|------------|---------|
| ESLint | ✅ Configured | None (Next.js default) | Linting |
| TypeScript | ✅ Configured | `tsconfig.json` | Type checking |
| Prettier | ❌ Not configured | None | Formatting |
| Jest | ❌ Not configured | None | Unit testing |
| Vitest | ❌ Not configured | None | Unit testing |
| Playwright | ❌ Not configured | None | E2E testing |
| Cypress | ❌ Not configured | None | E2E testing |

---

*Testing analysis: 2026-03-25*
