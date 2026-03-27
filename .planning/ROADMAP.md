# ROADMAP: MedConnect v1.0 Supabase Connection

**Created:** 2026-03-27  
**Granularity:** Standard (5 phases recommended, 3 core phases for v1)  
**Coverage:** 47/47 v1 requirements mapped ✓

---

## Phases

- [x] **Phase 1: Supabase Authentication & Session Management** - Users can securely sign up, log in, and maintain authenticated sessions with clinic context
- [x] **Phase 2: Database Schema & Row-Level Security** - Multi-clinic data isolation enforced at database layer; clinic boundaries cannot be bypassed
- [x] **Phase 3: API Service Layer & Frontend Integration** - Existing UI connected to persistent backend; all CRUD operations work against real Supabase tables

---

## Phase Details

### Phase 1: Supabase Authentication & Session Management

**Goal:** Users can securely sign up, log in, maintain sessions across device/browser refresh, and have authenticated clinic context established in JWT claims.

**Depends on:** Nothing (foundation phase)

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, USER-01, USER-02, USER-03, USER-04

**Success Criteria** (what must be TRUE):
1. User can sign up with email and password; verification email is sent and must be confirmed before login
2. User can log in with verified email; session persists across browser refresh and tab close/reopen
3. User session contains clinic_id and user_role claims in JWT token
4. User can log out; all session tokens are invalidated immediately
5. User can reset forgotten password via email link; password is updated in Supabase Auth
6. User session expires after 7 days of inactivity; user is redirected to login on next action
7. User can view own profile with clinic assignments and role displayed

**Plans:** TBD

---

### Phase 2: Database Schema & Row-Level Security

**Goal:** All core data entities persist in Supabase with clinic isolation enforced at the PostgreSQL layer; no query can leak data across clinic boundaries.

**Depends on:** Phase 1 (must have authenticated users with clinic context in JWT)

**Requirements:** DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10, ISOL-01, ISOL-02, ISOL-03, ISOL-04, ISOL-05, ISOL-06

**Success Criteria** (what must be TRUE):
1. All 10 core tables (clinics, patients, appointments, consultation_notes, vital_signs, medical_history, vaccine_records, attachments, prescriptions, doctor_profiles) exist in Supabase with proper schemas
2. Every table has clinic_id column (not nullable) and indexed for performance
3. Row-Level Security policies enforce clinic isolation: doctor from Clinic A cannot query Clinic B's patients even with direct SQL
4. RLS policies enforce role-based access: staff can read/write clinic data, doctors can read/write assigned patients, admins can read all
5. Integration tests verify: admin sees all clinics' data; doctor sees only assigned clinic; staff sees only their clinic
6. Supabase audit logs show no RLS denials for legitimate queries; all blocked queries are unauthorized (cross-clinic or wrong role)

**Plans:** TBD

**UI hint**: no

---

### Phase 3: API Service Layer & Frontend Integration

**Goal:** Existing frontend UI components connected to persistent Supabase backend; users can view, create, edit, and delete medical records with real data.

**Depends on:** Phase 2 (RLS must be proven before API queries can be trusted)

**Requirements:** API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10, FE-01, FE-02, FE-03, FE-04, FE-05, FE-06, ERR-01, ERR-02, ERR-03, ERR-04, ERR-05

**Success Criteria** (what must be TRUE):
1. Dashboard displays real appointments from Supabase; list updates when appointments are created/modified by any user in clinic
2. Patient list loads from Supabase with clinic filtering; staff can view all patients, doctors can view assigned patients only
3. Appointment calendar fetches and displays real data; staff can create/edit appointments
4. Patient profile pages load real medical history, vital signs, and attachments from Supabase
5. Form submissions (new patient, new appointment, add vital sign) write data to Supabase; validation errors shown to user
6. Clinic context verified on every page; user cannot access clinic they don't belong to (redirect to clinic selector or login)
7. User sees human-readable error messages if Supabase connection fails; system gracefully degrades (data shown in loading state, not blank/crash)
8. User is logged out if session expires (401 from server); redirected to login with "session expired" message
9. User attempting to access clinic they don't belong to gets error message and is not shown data from other clinics
10. Every API query includes clinic_id filter at app level (defense-in-depth with RLS)

**Plans:** TBD

**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Supabase Authentication & Session Management | 0/6 | Not started | - |
| 2. Database Schema & Row-Level Security | 0/5 | Not started | - |
| 3. API Service Layer & Frontend Integration | 0/8 | Not started | - |

---

## Requirement Coverage Map

**Phase 1 (11 requirements):**
- AUTH-01: Sign up with email/password
- AUTH-02: Email verification after signup
- AUTH-03: Log in with email/password
- AUTH-04: Reset password via email link
- AUTH-05: Session persists across refresh
- AUTH-06: Session expires after 7 days
- AUTH-07: User can log out
- USER-01: User profile stores clinic assignment
- USER-02: User has role assignment
- USER-03: User clinic context verified server-side
- USER-04: User can view own profile

**Phase 2 (16 requirements):**
- DATA-01 through DATA-10: Core table persistence (clinics, patients, doctors, appointments, consultation notes, vital signs, medical history, vaccine records, attachments, prescriptions)
- ISOL-01 through ISOL-06: RLS policies enforce clinic boundaries and role-based access

**Phase 3 (20 requirements):**
- API-01 through API-10: Service layer functions for CRUD operations (clinic-aware)
- FE-01 through FE-06: Frontend integration (dashboard, lists, forms, clinic context)
- ERR-01 through ERR-05: Error handling and user feedback

**Total Coverage:** 47/47 v1 requirements mapped ✓

---

## Phase Dependencies

```
Phase 1: Auth
    ↓ (users must be authenticated)
Phase 2: Schema + RLS
    ↓ (security must be proven)
Phase 3: API + Frontend
    ↓ (all 47 v1 requirements complete)
    
v1.0 Complete ✓
```

---

## Key Assumptions

1. **Research recommendations applied:** Phase structure derived from research SUMMARY.md but constrained to v1 requirements only
2. **Three core phases:** All 47 v1 requirements fit into Auth → Schema → API phases; optional Realtime (Phase 4) and Advanced (Phase 5) deferred to v2
3. **Each phase independently implementable:** Phase 1 can be built/tested in 1-2 weeks; Phase 2 builds on Phase 1; Phase 3 builds on Phase 2
4. **Defense-in-depth pattern:** App-level clinic_id filtering required in all Phase 3 queries (Layer 1); RLS provides backup enforcement (Layer 2)
5. **No legacy data:** Starting with clean Supabase databases; no migration from mock data

---

## Critical Pitfalls to Address

| Pitfall | Phase | Mitigation |
|---------|-------|-----------|
| RLS misconfiguration causes silent failures | Phase 2 | Mandatory integration tests for each role + clinic before Phase 3 |
| Clinic isolation bypass (HIPAA violation) | Phase 3 | Code review: grep every query for clinic_id filter |
| Deprecated auth helpers (@supabase/auth-helpers-nextjs) | Phase 1 | Use @supabase/ssr only; verify package.json immediately |
| Token refresh fails silently (401s) | Phase 1 | TTL testing; middleware.ts setup; token refresh on every request |
| Cookie size exceeds 4KB limit | Phase 1 | Dev tools verification in browser; monitor cookie size |

---

## Notes

- **Research confidence:** HIGH — All recommendations grounded in official Supabase, Next.js, and HIPAA documentation
- **HIPAA compliance:** Clinic isolation enforced at RLS layer (Phase 2); Business Associate Agreement with Supabase needed before production
- **Realtime deferral:** Phase 4 (optional) for real-time subscriptions; medical app functions with polling for v1
- **Schema flexibility:** 17 core entities prepared in research; Phase 2 can add/remove tables without impacting Phase 1 or 3

---

*Roadmap created: 2026-03-27*  
*Ready for phase planning via `/gsd-plan-phase 1`*
