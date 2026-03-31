# MedConnect Checks Plan

**Generated:** 2026-03-31
**Purpose:** Execute comprehensive verification checks to validate project completeness

---

## Phase Completion Status

| Phase | Name | Status | Verification Date |
|-------|------|--------|------------------|
| 02 | Supabase Authentication | ✅ Complete | 2026-03-27 (gaps fixed) |
| 03 | Database Schema & RLS | ✅ Complete | 2026-03-30 |
| 04 | API Service Integration | ✅ Complete | 2026-03-31 |

---

## 1. Authentication Checks (Phase 02)

### 1.1 Auth Flow Verification
- [ ] Sign up page renders correctly at `/auth/signup`
- [ ] Login page renders correctly at `/auth/login`
- [ ] Password reset page renders correctly at `/auth/reset-password`
- [ ] Email confirmation page renders correctly at `/auth/confirm-email`
- [ ] Profile page renders at `/dashboard/profile`

### 1.2 Session Management
- [ ] Middleware validates session on protected routes
- [ ] Unauthenticated users redirected to `/auth/login`
- [ ] Session persists across browser refresh
- [ ] Logout button visible in app header and functional

### 1.3 Supabase Configuration
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured in `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [ ] `@supabase/supabase-js` v2.100.1 installed
- [ ] `@supabase/ssr` v0.9.0 installed

---

## 2. Database Checks (Phase 03)

### 2.1 Schema Tables (execute `.supabase/001-schema.sql`)
- [ ] `clinics` table created with all columns
- [ ] `patients` table with `clinic_id` NOT NULL
- [ ] `doctor_profiles` table with `clinic_id` NOT NULL
- [ ] `appointments` table with `clinic_id` NOT NULL
- [ ] `consultation_notes` table with `clinic_id` NOT NULL
- [ ] `vital_signs` table with `clinic_id` NOT NULL
- [ ] `medical_history` table with `clinic_id` NOT NULL
- [ ] `vaccine_records` table with `clinic_id` NOT NULL
- [ ] `attachments` table with `clinic_id` NOT NULL
- [ ] `prescriptions` table with `clinic_id` NOT NULL

### 2.2 RLS Policies (execute `.supabase/002-rls-policies.sql`)
- [ ] RLS enabled on all 10 tables
- [ ] Admin can view all clinics (admin role policy)
- [ ] Users can view only their clinic
- [ ] Clinic isolation enforced on all SELECT queries
- [ ] Clinic isolation enforced on all INSERT queries
- [ ] Clinic isolation enforced on all UPDATE queries
- [ ] Staff-only DELETE policies work correctly

### 2.3 Integration Tests
- [ ] Run `npm test` to execute RLS isolation tests
- [ ] All 26 test cases pass
- [ ] No cross-clinic data leaks detected

---

## 3. API Integration Checks (Phase 04)

### 3.1 API Routes
- [ ] `GET /api/patients` returns clinic-filtered patients
- [ ] `POST /api/patients` creates patient in correct clinic
- [ ] `GET /api/patients/[id]` returns patient with clinic verification
- [ ] `PATCH /api/patients/[id]` updates patient with clinic check
- [ ] `DELETE /api/patients/[id]` deletes with clinic verification
- [ ] `GET /api/appointments` returns clinic appointments
- [ ] `POST /api/appointments` creates appointment in correct clinic

### 3.2 Frontend Integration
- [ ] Dashboard loads real appointments from Supabase
- [ ] Patient list shows real patients from Supabase
- [ ] Calendar displays real appointments
- [ ] Patient detail pages load real medical data
- [ ] New patient form writes to Supabase
- [ ] New appointment form writes to Supabase

### 3.3 Error Handling
- [ ] 401 errors trigger logout and redirect
- [ ] 403 errors show "access denied" message
- [ ] Network errors show user-friendly message
- [ ] Validation errors display field-level feedback

---

## 4. Requirements Traceability

### Authentication (AUTH-01 to AUTH-07)
- [ ] AUTH-01: Sign up with email/password
- [ ] AUTH-02: Email verification after signup
- [ ] AUTH-03: Login with email/password
- [ ] AUTH-04: Password reset via email
- [ ] AUTH-05: Session persists across refresh
- [ ] AUTH-06: Session expires after 7 days
- [ ] AUTH-07: Logout clears session

### User Management (USER-01 to USER-04)
- [ ] USER-01: Clinic assignment stored
- [ ] USER-02: Role assignment (admin/doctor/staff)
- [ ] USER-03: Server-side clinic verification
- [ ] USER-04: Profile page shows user info

### Data Persistence (DATA-01 to DATA-10)
- [ ] DATA-01 to DATA-10: All tables persist in Supabase

### Data Isolation (ISOL-01 to ISOL-06)
- [ ] ISOL-01 to ISOL-06: RLS enforces clinic boundaries

### API (API-01 to API-10)
- [ ] API-01 to API-10: Service layer with clinic context

### Frontend (FE-01 to FE-06)
- [ ] FE-01 to FE-06: UI integrated with Supabase

### Error Handling (ERR-01 to ERR-05)
- [ ] ERR-01 to ERR-05: Proper error handling

---

## 5. Build & Type Safety

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] TypeScript compilation succeeds
- [ ] No `TODO` or `FIXME` in critical paths

---

## 6. Manual Testing Checklist

### Auth Testing
- [ ] Create account at `/auth/signup`
- [ ] Verify email link received
- [ ] Complete email verification
- [ ] Login with verified account
- [ ] Refresh page - stay logged in
- [ ] Click logout - redirected to login
- [ ] Cannot access `/dashboard` without auth

### Multi-Clinic Testing
- [ ] Create two clinics in Supabase
- [ ] Assign users to different clinics
- [ ] User A cannot see User B's patients
- [ ] User A cannot see User B's appointments
- [ ] Admin can see all clinics

### CRUD Testing
- [ ] Create patient - appears in patient list
- [ ] Create appointment - appears in calendar
- [ ] Update patient - changes persist
- [ ] Delete patient - removed from list
- [ ] All operations respect clinic boundaries

---

## Execution Order

1. **Pre-flight** (Section 5): Build & type safety
2. **Database** (Section 2.1-2.2): Run SQL migrations in Supabase
3. **Unit Tests** (Section 2.3): Execute integration tests
4. **API Routes** (Section 3.1): Test all endpoints
5. **UI Flows** (Section 6): Manual testing
6. **Final Review** (All sections): Mark complete

---

## Notes

- Database migrations require Supabase project access
- Integration tests require test environment variables
- Manual testing requires live Supabase instance
- Some checks require two separate clinic accounts
