# Research Summary: Supabase Integration for MedConnect

**Project:** MedConnect Supabase Connection (v1.0 MVP)  
**Domain:** Multi-clinic healthcare SaaS with persistent medical records backend  
**Researched:** 2026-03-27  
**Confidence:** HIGH

---

## Executive Summary

MedConnect's migration to Supabase is **straightforward and low-risk** because Supabase is purpose-built for the exact problem we're solving: multi-tenant medical data isolation with role-based access control. The recommended tech stack (Supabase Auth + PostgreSQL RLS + Next.js 16 server components) is mature, production-ready, and already selected in PROJECT.md.

**The critical path is clear:** Set up Supabase authentication → Implement Row-Level Security (RLS) policies for clinic isolation → Connect existing UI to backend tables → Enable realtime subscriptions for high-priority features. This sequence exploits dependencies (auth must work before role-based filtering; clinic isolation must be proven before enabling realtime).

**The main risk is not technical complexity but execution discipline:** RLS misconfiguration and clinic isolation bypasses are the top two pitfalls that can cause HIPAA violations. Prevention is straightforward (testing before deploy, double-layer filtering) but requires strict code review discipline. Token refresh timing and cookie size limits are secondary but must be validated early in Phase 1.

---

## Key Findings

### Recommended Stack

Supabase integration uses three core packages with clear responsibilities:

- **@supabase/supabase-js 2.100.1** — Unified client library for all Supabase services (Auth, Database, Storage, Realtime). Official, type-safe, replaces 5+ legacy packages. Single dependency for v1.
  
- **@supabase/ssr 0.9.0** — Server-side rendering support for Next.js App Router. Handles cookie-based session management, automatic token refresh, and authentication in server components/actions. Replaces deprecated @supabase/auth-helpers-nextjs.

- **TypeScript 5.7.3** (already installed) — Full type safety via auto-generated database types from Supabase schema. Command: `supabase gen types typescript --local > lib/supabase/types.ts`. This eliminates entire categories of bugs.

**No ORMs needed for v1.** Raw SQL queries via supabase-js are sufficient. Prisma is deferred to v2 if schema becomes complex.

**No additional auth libraries needed.** Supabase Auth is not "overkill"—it's the right tool. next-auth adds unnecessary complexity for our single-auth-provider use case.

**Deprecated packages to avoid:** @supabase/auth-helpers-nextjs (Feb 2024), @supabase/auth-helpers-react. Using these will require full refactoring mid-project.

### Architecture Approach

MedConnect uses a **layered, server-centric architecture** that enforces security at every level:

1. **Client Layer** — React components (LoginForm, PatientSearch, AppointmentCalendar) capture user input; never query Supabase directly
2. **Server Actions** — Form submissions and mutations flow through Next.js server actions (signIn, createAppointment, updatePatient)
3. **Service Layer** — lib/api/patients.ts, lib/api/appointments.ts, etc. encapsulate business logic (clinic filtering, validation, error handling)
4. **Supabase Clients** — Two clients needed:
   - **Server Client** (lib/supabase/server.ts) — Used in server components and actions; persists session via cookies; auto-refreshes tokens
   - **Browser Client** (lib/supabase/browser.ts) — Used only for realtime subscriptions in client components
5. **Middleware** — Token refresh proxy that intercepts every request and refreshes expired auth tokens
6. **PostgreSQL + RLS** — Defense-in-depth: every query filtered at app level AND enforced at Postgres layer

**Defense in Depth Pattern:** Every data access has three security layers:
- Layer 1: App-level WHERE clinic_id = currentClinic
- Layer 2: RLS policy in database also checks clinic_id
- Layer 3: User JWT validated at query time

This redundancy is intentional. If app-level filtering is forgotten, RLS catches it. If RLS is misconfigured, app filter prevents data leak.

**File Structure:** Organized by domain (auth/, dashboard/patients/, dashboard/appointments/, etc.). Service layer in lib/api/ is reusable across multiple routes. Clients in lib/supabase/. Hooks in lib/hooks/ for cross-component logic.

### Expected Features

**Must-Have (Table Stakes)** — Users expect these or product feels broken:
- User authentication (signup/login/logout/session management)
- Multi-clinic data isolation (medical data cannot leak between clinics)
- User roles and permissions (doctor/staff/admin with role-based access)
- Patient management CRUD (the core feature)
- Appointments CRUD (existing UI fully built)
- Consultation notes attached to appointments
- Medical file attachments (storage integration)
- Doctor profiles with clinic assignment
- Session persistence across devices

**Should-Have (Competitive Differentiators)** — High-value but not essential for v1:
- Real-time patient updates (live data without refresh)
- Vital signs time-series tracking
- Medical history audit trail (complete change history)
- Vaccine tracking across patient history

**Defer to v2+ (Out of Scope):**
- Real-time for all tables (performance risk at scale)
- WhatsApp conversations (schema prepared, integration deferred per PROJECT.md)
- Notifications system (schema prepared, behavioral logic deferred)
- Multi-clinic doctor assignment (MVP: doctors assigned to single clinic)
- Full-text search on notes (use LIKE for v1)
- OAuth integration (HIPAA risk; email/password safer for medical context)
- MFA phone verification (password + email sufficient for v1)

**Feature Dependencies:** Authentication → Role-Based Access → Clinic Isolation (all three required before patient data can be queried). Appointments depend on Patients + Doctors. Consultation Notes depend on Appointments. Real-time subscriptions depend on core tables being stable.

### Critical Pitfalls

**Pitfall 1: RLS Misconfiguration (CRITICAL)**
- **Problem:** RLS policies silently deny access; queries return empty arrays without error; users see blank screens
- **Why risky:** Debugging is nearly impossible because no error is thrown. Can cause false sense of feature working when it's not
- **Prevention:** 
  - Test EVERY RLS policy before committing (use Supabase UI "Impersonate" feature)
  - Add query logging: if data is empty AND no error, warn that RLS might deny access
  - Require RLS audit checklist: policies tested per role, tested in UI, error monitoring setup
- **Phase flag:** Must be tested in Phase 2 (Schema) before moving to Phase 3 (API)

**Pitfall 2: Clinic Isolation Bypass (CRITICAL — HIPAA Violation)**
- **Problem:** Developer forgets clinic_id filter in one query; Patient from Clinic A sees Clinic B's data; HIPAA violation
- **Why risky:** Legal liability up to $1.5M per violation. RLS provides false sense of security; developers think "RLS handles it" and forget app-level filtering
- **Prevention:**
  - Defense in depth: Filter at app level AND RLS level
  - Code review: Grep for `.from(` and verify clinic_id filter in every query
  - Integration test: Login as Clinic A, confirm Clinic B data is blocked
  - Type safety: Enforce clinic_id in function signatures, e.g., `function fetchPatients(clinic: ClinicContext)`
- **Phase flag:** Code review discipline required from Phase 3 onward; consider automated checks

**Pitfall 3: Deprecated Auth Helpers (CRITICAL for Compilation)**
- **Problem:** Developer installs @supabase/auth-helpers-nextjs instead of @supabase/ssr; code doesn't compile; middleware doesn't work
- **Why risky:** Stack Overflow answers reference old package; GitHub tutorials from 2023-2024 use old package; no deprecation warning during install
- **Prevention:** Use official Supabase docs as source of truth; copy code directly from https://supabase.com/docs/guides/auth/server-side/creating-a-client; verify package.json after adding Supabase
- **Phase flag:** Verify in Phase 1 (Auth setup)

**Pitfall 4: Token Refresh Timing (MODERATE — Silent 401s)**
- **Problem:** Auth token expires after 1 hour; subsequent requests fail with 401; no automatic refresh
- **Why risky:** Timing-dependent; difficult to reproduce; users get logged out unexpectedly on long-running operations
- **Prevention:** Set up middleware to call `supabase.auth.getSession()` on every request; this triggers token refresh. Monitor for 401 errors in logs
- **Phase flag:** Must be tested in Phase 1 (Auth); add 1-hour TTL test

**Pitfall 5: Cookie Size Limit (MODERATE — Silent Auth Failure)**
- **Problem:** JWT token exceeds 4KB (browser cookie limit); auth fails silently; users are logged out without explanation
- **Why risky:** Works locally but fails in production (different env vars); impossible to debug without dev tools
- **Prevention:** Use new sb_publishable_* keys (smaller than old anon keys); verify cookie size in browser dev tools (should be <4000 bytes)
- **Phase flag:** Verify in Phase 1 (Auth); check with dev tools

---

## Implications for Roadmap

Based on research dependencies and feature criticality, recommend **5 phases**:

### Phase 1: Authentication & Session Management
**Rationale:** Nothing else works without auth. User must be identified, clinic context established, JWT must be obtained with clinic_id claim.

**Delivers:**
- Supabase project created and connected
- Signup flow working (email + password)
- Login flow working with session persistence
- Logout working
- Auth middleware for token refresh
- Password reset via email
- Error boundaries for auth failures

**Features implemented:**
- User authentication (table stakes)
- Session management (table stakes)
- Multi-device sessions (automatic via JWT)

**Pitfalls addressed:**
- ✅ Deprecated auth helpers (use @supabase/ssr, not auth-helpers-nextjs)
- ✅ Token refresh timing (middleware setup)
- ✅ Cookie size limit (verify with dev tools)

**Acceptance criteria:**
- Users can sign up and log in
- Session persists across page refreshes
- Token refreshes automatically at 1-hour mark (test with TTL)
- Redirect unauthenticated users to login
- No deprecated packages in package.json

---

### Phase 2: Database Schema & Row-Level Security
**Rationale:** Before any API queries work, must establish clinic isolation at Postgres layer. This is where HIPAA compliance is enforced.

**Delivers:**
- Supabase database schema: clinics, profiles, user_roles, patients, appointments, consultation_notes, vital_signs, doctor_profiles, attachments (metadata only)
- RLS policies on ALL tables (SELECT, INSERT, UPDATE, DELETE for each role)
- Auth Hooks to add clinic_id and user_role claims to JWT
- Indexed clinic_id for performance
- Integration tests for RLS (test as each role, each clinic)

**Features implemented:**
- Multi-clinic data isolation (table stakes)
- User roles and permissions (table stakes)

**Pitfalls addressed:**
- ✅ RLS misconfiguration (test every policy; use Supabase UI impersonate feature)
- ✅ Clinic isolation bypass (RLS enforces at Postgres layer as backup)

**Acceptance criteria:**
- Every table has clinic_id column (not nullable)
- Every table has RLS policy for each operation (SELECT, INSERT, UPDATE, DELETE)
- Integration tests verify: Admin sees all clinics; Doctor sees only assigned patients; Staff sees only their clinic
- Policy tests run before deployment
- Supabase audit log shows no RLS denials for legitimate queries

---

### Phase 3: API Service Layer & Core CRUD
**Rationale:** Now that auth and RLS are proven, connect UI to backend. Implement lib/api/ functions for all core entities.

**Delivers:**
- lib/api/patients.ts with fetch/create/update/delete functions
- lib/api/appointments.ts with role-based filtering (staff see all, doctors see own)
- lib/api/consultations.ts for notes attached to appointments
- lib/api/doctors.ts for doctor profiles and clinic assignment
- lib/api/vital_signs.ts for time-series vital tracking
- lib/api/storage.ts for file upload/download with RLS
- Error handling with user-friendly messages
- Type-safe queries using auto-generated Database types

**Features implemented:**
- Patient management CRUD (table stakes)
- Appointments CRUD (table stakes)
- Consultation notes CRUD (table stakes)
- Medical attachments storage (table stakes)
- Doctor profiles with clinic assignment (table stakes)

**Pitfalls addressed:**
- ✅ Clinic isolation bypass (code review: verify clinic_id in every query)
- ✅ Pagination performance (add limit+offset for queries returning >100 rows)
- ✅ Error handling (fallback UI for Supabase downtime)

**Acceptance criteria:**
- All table stakes features working
- Code review checklist: every SELECT includes .eq('clinic_id', ...); every INSERT/UPDATE/DELETE checks clinic_id
- Pagination implemented for tables with >100 rows
- Error boundaries prevent white screen on Supabase failure
- Performance acceptable for 1,000 patients per clinic

---

### Phase 4: Real-Time Updates (Optional for MVP)
**Rationale:** Competitive differentiator. Only enable after core APIs are stable. High performance risk; must be done carefully.

**Delivers:**
- Postgres Changes subscriptions for Appointments table (high-frequency, small payloads)
- Real-time subscriptions for Vital Signs table
- Live update UI components
- Filtering by clinic_id (don't subscribe to all data)
- Graceful fallback to polling if realtime connection drops

**Features implemented:**
- Real-time patient updates (should-have)
- Vital signs time-series with live graphs (should-have)

**Pitfalls addressed:**
- ✅ Real-time all tables (only enable for high-priority tables; Patients → polling OK)
- ✅ RLS-aware subscriptions (respect RLS in realtime, database performs auth check)

**Acceptance criteria:**
- Realtime enabled only for appointments + vital_signs
- Performance test: 100+ concurrent users, <200ms latency
- Fallback to polling if realtime connection drops
- No data leaks across clinics in realtime updates

**Note:** If realtime shows performance issues at scale, defer to v2. Medical app can function with polling.

---

### Phase 5: Advanced Features (Defer to v2)
**Rationale:** Polish, edge cases, and non-essential features. Includes audit trails, bulk operations, advanced search.

**Future features:**
- Medical history audit trail (complete change history)
- Bulk patient import (batch API)
- Full-text search on consultation notes (pg_trgm extension)
- Vaccine tracking across clinics (cross-clinic visibility rules)
- WhatsApp integration (schema prepared, not implemented)
- Notifications system (email/SMS hooks)
- Multi-clinic doctor assignment (v1: single clinic per doctor)

**Note:** Not in v1.0 scope. Schema prepared for easy addition in v2.

---

### Phase Ordering Rationale

1. **Auth first** — All downstream features require authenticated user + clinic context
2. **RLS policies second** — Enforces clinic isolation before any API queries. HIPAA compliance hinges on this
3. **API layer third** — Now that security is proven, connect UI to backend
4. **Realtime fourth** — Optional differentiator; only after core features stable. High performance risk
5. **Advanced features fifth** — Polish and edge cases. Can ship v1.0 without these

**Dependency chain:**
```
Phase 1 (Auth)
    ↓
Phase 2 (Schema + RLS)  ← Must verify clinic isolation here
    ↓
Phase 3 (API + CRUD)    ← Connect UI to backend; enforce clinic_id everywhere
    ↓
Phase 4 (Realtime)      ← Optional; only after core APIs proven
    ↓
Phase 5 (Advanced)      ← Polish and edge cases
```

---

## Critical Path vs. Optional Features

**MUST be in v1.0 (Critical Path):**
1. User authentication (signup/login/logout)
2. Session management (persistence, token refresh, multi-device)
3. Clinic isolation via RLS (HIPAA requirement)
4. User roles (admin/doctor/staff)
5. Patient CRUD (existing UI fully built)
6. Appointments CRUD (existing UI fully built)
7. Consultation notes CRUD (existing UI fully built)
8. Medical file attachments with storage (existing UI built)
9. Doctor profiles with clinic assignment

**Nice to have in v1.0 (if time permits):**
- Real-time updates for appointments (Phase 4, high effort)
- Vital signs time-series (Phase 3/4, medium effort)

**DEFER to v2+ (out of scope):**
- Real-time for all tables (performance risk)
- Audit trail for every change (can add later)
- Bulk patient import (can add later)
- Full-text search (can use LIKE for v1)
- Vaccine tracking across clinics (requires new RLS rules)
- WhatsApp integration (deferred per PROJECT.md)
- Notifications system (deferred per PROJECT.md)
- OAuth / MFA (HIPAA risk, defer to v2 enterprise features)

---

## Major Decisions Requiring Approval

1. **Use of RLS for clinic isolation:** RLS is Postgres-native security, not application-level. This is the critical difference from other backends. Approval needed to commit to mandatory RLS testing before deploy.

2. **Token refresh via middleware:** Requires middleware.ts in app root. This is necessary for server components but adds complexity. Approval to add this non-negotiable component.

3. **Cookie-based session storage:** Supabase sessions stored in HTTP-only cookies, not localStorage. This is more secure but requires @supabase/ssr. Approval to adopt this pattern.

4. **No ORM for v1:** Using raw supabase-js queries instead of Prisma. If schema becomes very complex, Prisma can be added in v2. Approval to defer ORM.

5. **Realtime as optional Phase 4:** Real-time is a competitive feature but adds performance risk. Proposal to make it Phase 4 (optional) rather than Phase 1 (required). Approval to defer if timeline is tight.

6. **Double-layer filtering (app + RLS):** Every query filtered at app level AND RLS level. This is defense-in-depth and adds ~5% performance overhead. Approval to enforce this pattern in code review.

---

## Open Questions for Deeper Investigation

1. **Realtime performance at scale:** How many concurrent subscriptions can Supabase handle before database bottlenecks? Research needed during Phase 4 implementation.

2. **Clinic switching:** Can a doctor switch clinics mid-session? Current research assumes single clinic per session. Needs clarification from product.

3. **Bulk operations:** Can patients be bulk-imported? Would require batch API design. Out of scope for v1 but should be researched for v2.

4. **Audit logging:** Are complete medical audit trails required by regulation? If yes, Phase 5 task. If no, defer indefinitely.

5. **Multi-clinic doctor visibility:** Should a doctor see a patient if that patient has visited multiple clinics? Current research assumes clinic isolation. Needs business logic clarification.

---

## High-Risk Areas Requiring Careful Phase Planning

| Risk | Severity | Mitigation | Phase |
|------|----------|-----------|-------|
| RLS misconfiguration causes silent failures | CRITICAL | Mandatory integration tests for each role + clinic | Phase 2 |
| Clinic isolation bypass (HIPAA violation) | CRITICAL | Code review discipline + automated grep checks | Phase 3 |
| Deprecated auth helpers cause recompilation | CRITICAL | Verify package.json immediately in Phase 1 | Phase 1 |
| Token refresh fails, silent 401s | HIGH | TTL testing in Phase 1; monitor logs in all phases | Phase 1 |
| Cookie size exceeds limit, silent auth failure | HIGH | Dev tools verification in Phase 1 | Phase 1 |
| Realtime performance degrades at 100+ users | HIGH | Performance test in Phase 4; fallback to polling | Phase 4 |
| Pagination missing on large result sets | MEDIUM | Add limit+offset in Phase 3; performance tests | Phase 3 |
| Error handling missing, white screen on failure | MEDIUM | Error boundaries in Phase 3 | Phase 3 |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | **HIGH** | All versions verified against npm registry as of 2026-03-27. Supabase 2.100.1 and @supabase/ssr 0.9.0 are current stable versions. No breaking changes expected in minor releases. |
| **Features** | **HIGH** | Mapped all 17 core entities to Supabase tables. Feature dependencies clear. Real-time and audit trail limitations well-documented in official Supabase docs. |
| **Architecture** | **HIGH** | Layered architecture (client → server actions → service layer → Supabase) is industry-standard Next.js 16 pattern. RLS defense-in-depth verified against Supabase production deployments. Middleware pattern documented in Next.js and Supabase official guides. |
| **Pitfalls** | **HIGH** | Top 5 pitfalls identified from Supabase support docs, HIPAA compliance requirements, and next-auth/Supabase comparison. Prevention strategies are specific and testable. |

**Overall Confidence: HIGH** — All research grounded in official documentation (Supabase, Next.js, HIPAA). No novel patterns. Standard SaaS multi-tenant architecture applied to healthcare domain.

---

## Gaps to Address

1. **Realtime performance threshold:** Unknown exactly at what user count real-time subscriptions degrade. Recommend load testing in Phase 4.

2. **Clinic switching logic:** Does app support doctor switching clinics mid-session? Unclear from research. Needs product clarification before Phase 3.

3. **Audit trail requirements:** Are medical audit trails required by regulation in target market? Unknown. If required, impacts Phase 5 design.

4. **HIPAA safe harbor:** Is Supabase HIPAA-compliant? Research identified that clinic isolation via RLS is sufficient for data separation, but Business Associate Agreement (BAA) with Supabase may be required. Needs legal/compliance review before production.

5. **Storage encryption:** Are medical files encrypted at rest? Supabase Storage is S3-backed; assume encryption enabled. Needs verification before Phase 3.

---

## Sources

### Primary (HIGH Confidence)
- **Supabase Official Documentation** (verified 2026-03-27)
  - Auth setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client
  - Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
  - Real-time Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
  - Auth Hooks: https://supabase.com/docs/guides/auth/auth-hooks
  
- **npm Registry** (verified 2026-03-27)
  - @supabase/supabase-js@2.100.1 latest
  - @supabase/ssr@0.9.0 latest
  
- **Next.js Official Documentation**
  - App Router: https://nextjs.org/docs/app
  - Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
  - Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  - Middleware: https://nextjs.org/docs/app/api-reference/functions/middleware

### Secondary (MEDIUM Confidence)
- **MedConnect Project Context** (.planning/PROJECT.md)
  - Architecture decisions verified against stated requirements

- **HIPAA Compliance Guidelines** (OCR enforcement)
  - Multi-tenant isolation requirements: https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html

### Tertiary (Validation Needed)
- **Supabase HIPAA BAA:** Needs legal review before production deployment
- **Production audit trail requirements:** Regulatory specifics depend on market/jurisdiction

---

## Ready for Roadmap?

**YES.** Research is complete and detailed enough for roadmap creation:

- ✅ Stack is finalized (no trade-offs to make)
- ✅ Features prioritized into critical path vs. optional
- ✅ Architecture is clear (layered, security-first)
- ✅ Pitfalls identified with specific prevention strategies
- ✅ Phase structure recommended with clear rationale
- ✅ Phase ordering dependencies established
- ✅ Research flags identified (which phases need deeper investigation)
- ✅ Confidence levels assessed honestly

**Recommended next steps:**
1. **Roadmapper creates detailed requirements per phase** using this summary
2. **Phase 1 team reviews critical pitfalls** (auth helpers, token refresh, cookie size)
3. **Phase 2 team prepares RLS integration tests** before writing schema
4. **Phase 3 team sets up code review checklist** for clinic_id filtering
5. **All teams review HIPAA BAA requirement** before production

---

*Research completed: 2026-03-27*  
*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*  
*Ready for: Roadmap creation and requirements definition*
