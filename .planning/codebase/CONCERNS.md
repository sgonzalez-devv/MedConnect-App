# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Mock Data as Production Data:**
- Issue: Application uses a 867-line mock data file (`lib/mock-data.ts`) as the single source of truth. No real backend API integration exists, making it impossible to persist or retrieve actual data.
- Files: `lib/mock-data.ts`, all pages in `app/(app)/**`
- Impact: Any patient registrations, appointment bookings, or medical records are lost on page refresh. Application is non-functional for real use.
- Fix approach: Implement backend API layer with database integration. Create middleware to replace mock data imports with API calls. Plan for data persistence before production launch.

**No Authentication or Authorization:**
- Issue: Login page (`app/login/page.tsx`) bypasses authentication entirely—accepts any email/password combination and redirects to dashboard via `setTimeout`.
- Files: `app/login/page.tsx`, `app/onboarding/page.tsx`
- Impact: Any user can access any other user's medical records and patient data. HIPAA/medical privacy violations. No audit trail of who accessed what data.
- Fix approach: Implement proper authentication (JWT, OAuth, or session-based). Add role-based access control (RBAC) for doctors vs patients. Add request authentication middleware. Implement audit logging.

**Fake Async Operations:**
- Issue: Form submissions use fake promises with `setTimeout` to simulate loading states instead of actual API calls.
- Files: `app/login/page.tsx` (line 28), `app/(app)/pacientes/nuevo/page.tsx` (line 79), `app/(app)/calendario/nueva-cita/page.tsx`
- Impact: Users have no feedback on actual operation success/failure. No error handling patterns established. Data isn't actually saved.
- Fix approach: Replace all `new Promise((resolve) => setTimeout(resolve, ...))` with real API calls using fetch or library like SWR/React Query. Add proper error handling with try/catch and user feedback.

**TypScript Build Error Ignoring:**
- Issue: `next.config.mjs` contains `typescript: { ignoreBuildErrors: true }` which masks all type safety issues.
- Files: `next.config.mjs`
- Impact: Type errors are silently ignored, allowing bugs to reach production. Reduces confidence in type safety.
- Fix approach: Remove the ignore directive and fix all TypeScript errors properly. Use strict type checking in CI/CD.

## Security Considerations

**No Password Security:**
- Risk: Login form stores password in plain text component state and displays it in browser DevTools when toggled visible.
- Files: `app/login/page.tsx` (lines 15-21, 104-121)
- Current mitigation: None
- Recommendations: 
  1. Never handle passwords on frontend—send directly to backend via HTTPS
  2. Implement proper authentication flow (OAuth, SAML, or secure token exchange)
  3. Use form submission with proper CSRF tokens
  4. Implement password reset workflow on backend

**Sensitive Medical Data in Frontend:**
- Risk: All patient medical records, appointment history, vital signs, and lab results exist as JavaScript object literals in mock data file, accessible via browser console.
- Files: `lib/mock-data.ts` (contains full patient records including allergies, conditions, medical history)
- Current mitigation: None
- Recommendations:
  1. Move all medical data to backend database with access control
  2. Implement server-side data fetching in Next.js Server Components
  3. Add field-level encryption for PII/medical data
  4. Implement data residency and compliance (HIPAA, GDPR)

**Unimplemented Password Recovery:**
- Risk: "Forgot password?" link (`app/login/page.tsx` line 151) points to `href="#"`, suggesting unimplemented feature that could leak into production without mechanism to recover accounts.
- Files: `app/login/page.tsx`
- Current mitigation: Link is disabled/unimplemented
- Recommendations:
  1. Implement secure password reset flow with email verification
  2. Add time-limited reset tokens
  3. Require verification before allowing password change
  4. Log all password reset attempts for audit

**No Input Validation or Sanitization:**
- Risk: Patient name, email, phone, and medical notes are accepted without any validation. Potential for injection attacks or malformed data.
- Files: `app/(app)/pacientes/nuevo/page.tsx`, all form pages
- Current mitigation: HTML5 basic `required` attributes only
- Recommendations:
  1. Add Zod validation schema (library already installed)
  2. Validate all inputs server-side before storage
  3. Sanitize text inputs to prevent injection
  4. Use parameterized queries for any database operations

## Performance Bottlenecks

**Single Huge Page Component:**
- Problem: Patient detail page (`app/(app)/pacientes/[id]/page.tsx`) is 966 lines with all logic in one component, including data fetching, display, and multiple tabs.
- Files: `app/(app)/pacientes/[id]/page.tsx`
- Cause: No component extraction or code splitting. All tabs and sections rendered even if not visible.
- Improvement path: 
  1. Split into smaller components (`PatientHeader`, `PatientTabs`, `MedicalHistoryTab`, etc.)
  2. Implement lazy loading for tab content
  3. Use React.memo for expensive components
  4. Consider moving complex calculations to custom hooks

**No Code Splitting or Lazy Loading:**
- Problem: All routes load everything upfront. Appointment calendar with animations (`app/(app)/calendario/page.tsx`, 480 lines) loads fully regardless of user navigation.
- Files: All page files in `app/(app)/**`
- Cause: No dynamic imports or lazy route loading implemented
- Improvement path:
  1. Use `next/dynamic` for heavy components
  2. Implement route-based code splitting
  3. Add Suspense boundaries for streaming
  4. Profile bundle size with `next/bundle-analyzer`

**Large Mock Data File:**
- Problem: 867-line `mock-data.ts` file is parsed and included in client bundle, containing duplicate data structures and functions that could be optimized.
- Files: `lib/mock-data.ts`
- Cause: Monolithic data file with generators, appointments, conversations, notes all mixed together
- Improvement path:
  1. Split into separate domain files (`patients.ts`, `appointments.ts`, etc.)
  2. Implement data generators as functions instead of hardcoded arrays
  3. Once backend exists, remove client-side mock data entirely
  4. Use server-side data fetching in Next.js App Router

**No Caching Strategy:**
- Problem: Patient appointments, medical history, and vital signs are recalculated on every page render. No memoization or query caching.
- Files: All page files using data from `mock-data.ts`
- Cause: Direct function calls without caching mechanism
- Improvement path:
  1. Implement React Query or SWR for data fetching and caching
  2. Add stale-while-revalidate patterns
  3. Use server-side caching with revalidate tags
  4. Memoize expensive calculations with useMemo/useCallback

## Areas Lacking Test Coverage

**No Tests Exist:**
- What's not tested: Every feature in the application (forms, calculations, data transformations, UI interactions)
- Files: Entire `app/` and `components/` directories
- Risk: Changes to patient form or appointment booking logic could break without detection. Regression bugs in calculation of age, BMI, or appointment status changes.
- Priority: High

**Specific Untested Calculations:**
- Files: `app/(app)/pacientes/[id]/page.tsx` (line 100 - BMI calculation), `app/(app)/dashboard/page.tsx` (line 381 - completion percentage calculation)
- Risk: Incorrect health metrics displayed to doctors
- Recommendation: Add unit tests for all medical calculations

**No Component Integration Tests:**
- Files: All form pages (`pacientes/nuevo/page.tsx`, `calendario/nueva-cita/page.tsx`)
- Risk: Form submissions could silently fail or not submit required data
- Recommendation: Add integration tests for form workflows

## Code Duplication and Maintainability Issues

**Repeated Estado Configuration:**
- Issue: `estadoConfig` object (mapping appointment status to display labels) is duplicated across multiple files.
- Files: 
  - `app/(app)/dashboard/page.tsx` (lines 32-39)
  - `app/(app)/pacientes/[id]/page.tsx` (lines 51-58)
  - Likely in other files too
- Impact: Changing status display requires updates in multiple places. Risk of inconsistency.
- Fix approach: Move to `lib/constants.ts` or create reusable component. Export single source of truth.

**Date Formatting Utility Duplication:**
- Issue: Inline date formatting with `toLocaleDateString()` appears throughout components instead of using centralized utility.
- Files: `app/(app)/pacientes/[id]/page.tsx` (line 125), various locations
- Impact: Inconsistent date formats across application. Hard to maintain localization.
- Fix approach: Use existing `lib/date-utils.ts` functions consistently. Add missing format helpers.

**Form State Management Pattern:**
- Issue: Each form uses identical useState pattern with spread operator: `setFormData({ ...formData, field: value })` without abstraction.
- Files: `app/login/page.tsx`, `app/(app)/pacientes/nuevo/page.tsx`, `app/onboarding/page.tsx`, multiple others
- Impact: Boilerplate code, difficult to add validation/sanitization consistently
- Fix approach: Create custom hook `useFormData(initialState)` or use `react-hook-form` (already installed) more thoroughly

**Repeated Button/Link Styling:**
- Issue: Hover and transition classes repeated across buttons: `hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-200`
- Files: `app/(app)/dashboard/page.tsx` (lines 105, 169, 261, 314)
- Impact: Inconsistent styling, hard to maintain design system
- Fix approach: Create button variant components in `components/ui/` or use Tailwind composition utilities

## Scalability Concerns

**No Pagination:**
- Current capacity: Can display full patient list, appointment calendar, and conversation history in memory
- Limit: Application will become extremely slow with >1000 patients or >10000 appointments
- Scaling path:
  1. Implement server-side pagination with offset/limit parameters
  2. Add cursor-based pagination for large datasets
  3. Use virtual scrolling for large lists (component exists: `react-resizable-panels`)
  4. Implement infinite scroll patterns

**Single-Doctor Architecture:**
- Issue: Application assumes single doctor user (hardcoded `doctorProfile` in mock data)
- Files: `lib/mock-data.ts` (line 14-25)
- Impact: Cannot support clinic with multiple doctors, staff, or administrators
- Scaling path:
  1. Add organization/clinic entity to data model
  2. Implement role-based access control (doctor, staff, admin)
  3. Add multi-tenant support in database schema
  4. Implement permission checks on all operations

**No Rate Limiting or Request Throttling:**
- Issue: Once backend exists, no protection against DoS or abuse
- Files: All pages with form submissions
- Current mitigation: None
- Recommendations:
  1. Implement server-side rate limiting (IP-based and user-based)
  2. Add request throttling on client side
  3. Implement exponential backoff for retries

## Dependencies at Risk

**Next.js TypeScript Build Errors Hidden:**
- Risk: Configuration ignores all TypeScript errors, masking potential issues
- Impact: Type safety is illusory—errors will appear in production
- Migration plan: Remove `ignoreBuildErrors: true` from `next.config.mjs` and fix all errors

**Hardcoded Chart Component:**
- Risk: `components/ui/chart.tsx` uses `dangerouslySetInnerHTML` to inject theme CSS, creating XSS vulnerability if theme data is compromised
- Files: `components/ui/chart.tsx`
- Recommendation: Use CSS-in-JS or Tailwind classes instead of innerHTML injection

**Radix UI Dependency Sprawl:**
- Risk: 30+ Radix UI component packages installed, each with separate updates needed
- Impact: Security vulnerabilities in one component library require updating all
- Mitigation: Use component composition to reduce surface area. Consider shadcn/ui alternatives.

## Missing Critical Features

**No Real-Time Updates:**
- Problem: Application doesn't reflect changes made by other users or devices. Patient list is stale on page load.
- Impact: Doctor could miss new appointments or patient messages
- Recommendation: Implement WebSocket or server-sent events (SSE) for real-time updates

**No Offline Support:**
- Problem: Application requires internet connection for all operations (once backend exists)
- Impact: Doctor cannot access patient records or make notes if connection drops
- Recommendation: Implement service worker and offline sync patterns

**No Audit Logging:**
- Problem: No record of who accessed what patient data or made what changes
- Impact: HIPAA compliance violations, cannot investigate data breaches
- Recommendation: Implement comprehensive audit trail with timestamp, user, action, and data changed

**No Data Export/Integration:**
- Problem: No way to export patient records or integrate with other medical systems
- Impact: Data is locked in platform, difficult to migrate
- Recommendation: Implement HL7/FHIR standard exports, integration APIs

## Areas Deviating from Established Patterns

**Inconsistent Error Handling:**
- Issue: No try/catch blocks or error boundaries anywhere in application
- Files: All pages and components
- Impact: Application crashes silently or shows JavaScript errors to users
- Fix approach: Add error boundaries at route level. Implement consistent error handling pattern for all async operations.

**Mixed Client/Server Component Boundaries:**
- Issue: All pages marked with `"use client"` even though some could be Server Components
- Files: All page files
- Impact: Lost opportunity for server-side rendering, increased client bundle
- Fix approach: Audit each page. Move data fetching to Server Components. Use `"use client"` only for interactive components.

**No Suspense Boundaries:**
- Issue: No fallback UI during data loading. No streaming support for slow operations
- Files: All pages with data dependencies
- Impact: Poor user experience while data loads
- Fix approach: Wrap data fetching in Suspense with fallback skeletons

**Unused Import of `use` Hook:**
- Issue: Patient detail page imports `use` hook from React but doesn't follow async component pattern
- Files: `app/(app)/pacientes/[id]/page.tsx` (line 3, 65)
- Impact: Mixing patterns creates confusion for maintainers
- Fix approach: Either fully adopt async Server Components or remove `use()` hook usage

## Complexity Hotspots

**Patient Detail Page (966 Lines):**
- Location: `app/(app)/pacientes/[id]/page.tsx`
- Complexity: Single component handles header, tabs, all tab content (summary, appointments, medical records, communications), calculations (age, BMI), filtering, data transformation
- Cognitive load: Very high—difficult to understand data flow and make changes
- Risk: High probability of introducing bugs when modifying
- Refactoring strategy:
  1. Extract header to `PatientHeader` component
  2. Extract tab content to separate components: `PatientSummary`, `AppointmentHistory`, `MedicalRecords`, `Communications`
  3. Move calculations to custom hooks: `usePatientAge()`, `useBMI()`
  4. Create reusable `MedicalHistoryList`, `VitalSignsChart` components

**Calendar Page (480 Lines):**
- Location: `app/(app)/calendario/page.tsx`
- Complexity: Calendar view with multiple filtering options, detailed appointment cards, animations, and state management
- Risk: Performance issues with month view of 100+ appointments
- Refactoring strategy:
  1. Extract calendar grid to separate component
  2. Create `AppointmentCard` component
  3. Move filtering logic to custom hook
  4. Implement virtual scrolling for day views

**Configuration Page (516 Lines):**
- Location: `app/(app)/configuracion/page.tsx`
- Complexity: Unknown without reading, but likely contains multiple settings forms
- Recommendation: Review and split into logical setting sections with separate components

## Data Integrity Concerns

**No Validation of Medical Data:**
- Issue: Patient allergies, chronic conditions, vital signs entered without validation
- Files: All patient data entry forms
- Risk: Doctor enters "High blood pressure" instead of standardized code, making data unusable
- Fix approach: Create dropdown lists with predefined medical conditions (ICD-10 codes). Validate all medical inputs against standard vocabularies.

**Age Calculation from Birth Date:**
- Issue: Age calculated at page load time (`app/(app)/pacientes/[id]/page.tsx` line 83) but doesn't update across year boundaries
- Files: `app/(app)/pacientes/[id]/page.tsx`, likely other places
- Risk: Patient shown as one year younger after their birthday passes
- Fix approach: Implement date utility function that recalculates on each render or use server-side calculation

**Vital Signs Not Validated:**
- Issue: No validation that blood pressure, heart rate, temperature values are within reasonable ranges
- Files: All vital sign entry forms
- Risk: Data entry errors go undetected (e.g., blood pressure entered as "250/150" which is dangerously high or "25/15" which is too low)
- Fix approach: Add validation range checks for all vital sign measurements

---

*Concerns audit: 2026-03-25*
