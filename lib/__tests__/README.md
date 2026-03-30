# RLS Integration Tests

## Setup

1. Create a test Supabase project (separate from dev/prod)
2. Run migration: `supabase db push --db-url $TEST_SUPABASE_URL < lib/db-schema.sql`
3. Run RLS policies: `supabase db push --db-url $TEST_SUPABASE_URL < lib/db-rls-policies.sql`
4. Generate test JWT tokens with clinic_id and role claims
5. Copy .env.test.example to .env.test and fill in credentials

## Running Tests

```bash
npm test -- rls-isolation
```

## What Tests Verify

- RLS SELECT policies: admin sees all, doctor/staff see own clinic
- RLS INSERT policies: cannot insert in other clinic
- RLS UPDATE/DELETE policies: cannot modify other clinic data
- All 10 tables enforce clinic boundaries
- Clinic isolation is not bypassable at database layer

## Test Coverage

**Tables tested (10 total):**
1. CLINICS — access control (admin sees all, user sees own)
2. PATIENTS — SELECT, INSERT clinic isolation
3. APPOINTMENTS — clinic-specific visibility and INSERT restrictions
4. VITAL_SIGNS — read-only clinic isolation
5. MEDICAL_HISTORY — read-only clinic isolation
6. PRESCRIPTIONS — DELETE role restrictions
7. ATTACHMENTS — document isolation
8. DOCTOR_PROFILES — staff management by clinic
9. CONSULTATION_NOTES — clinical data protection
10. VACCINE_RECORDS — patient data isolation

**Test scenarios (26 total):**
- Admin queries all clinics (policies allow ✓)
- Doctor queries assigned clinic only (RLS filters ✓)
- Doctor cannot query other clinic (RLS blocks ✓)
- Staff queries own clinic (RLS filters ✓)
- Staff cannot INSERT in other clinic (RLS blocks ✓)
- All CRUD operations respect clinic boundaries (verified)

## Key Points

- Tests use **real Supabase client** (not mocked)
- Test tokens are JWT with `clinic_id` and `user_role` claims
- RLS policies enforced at **PostgreSQL layer** (cannot be bypassed)
- Tests prove clinic isolation is database-backed, not just app logic
- Ready for CI/CD integration
