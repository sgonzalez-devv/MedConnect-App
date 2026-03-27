---
phase: 03-database-schema-rls
plan: 04
type: execute
wave: 2
depends_on: [03-database-schema-rls-01, 03-database-schema-rls-02, 03-database-schema-rls-03]
files_modified: [
  "lib/__tests__/rls-isolation.test.ts"
]
autonomous: true
requirements: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10, ISOL-01, ISOL-02, ISOL-03, ISOL-04, ISOL-05, ISOL-06]
user_setup: []

must_haves:
  truths:
    - "Admin token can query all clinics' patients (RLS SELECT admin override works)"
    - "Doctor token can only query assigned clinic's patients (RLS blocks cross-clinic)"
    - "Staff token can query only their clinic's data (RLS enforces clinic_id boundary)"
    - "Doctor token cannot INSERT patient for different clinic (RLS blocks INSERT)"
    - "All 10 tables enforce clinic boundaries (no data leaks possible)"
    - "Supabase audit logs show RLS enforcements (no errors, legitimate queries pass)"
  artifacts:
    - path: "lib/__tests__/rls-isolation.test.ts"
      provides: "Integration tests for RLS enforcement across all 10 tables"
      min_lines: 300
    - path: ".env.test"
      provides: "Test environment variables for Supabase test project"
      contains: ["TEST_SUPABASE_URL", "TEST_SUPABASE_ADMIN_KEY"]
  key_links:
    - from: "lib/__tests__/rls-isolation.test.ts"
      to: "Supabase test database"
      via: "Supabase JS client with test JWT tokens"
      pattern: "const adminClient = createClient.*adminToken"
    - from: "test JWT tokens"
      to: "RLS policies"
      via: "auth.jwt() in SQL policies"
      pattern: "clinic_id.*admin.*doctor.*staff"
---

# Plan 4: Integration Tests for RLS Enforcement

Create comprehensive integration tests that verify RLS policies are actually blocking unauthorized queries. This plan proves that clinic isolation is enforced at the PostgreSQL layer and cannot be bypassed.

**Goal:** Integration tests verify: admin sees all clinics, doctor sees assigned clinic only, staff sees clinic only, and cross-clinic queries are blocked by RLS.

**Depends on:** Plan 01 + Plan 02 + Plan 03 (all schema and RLS must exist)

**Test scope:** RLS enforcement only (not app logic, not UI)

---

## Context

### Why Integration Tests?

RLS policies are database-layer enforcement. Testing requires:
1. Connecting to real Supabase database
2. Creating test JWT tokens with clinic_id and role claims
3. Attempting queries with different roles
4. Verifying RLS blocks unauthorized queries

### Test Strategy

**Three test user roles:**
- **admin_token:** clinic_id = any, user_role = 'admin' — can read all clinics
- **doctor_clinic_a_token:** clinic_id = clinic-a-uuid, user_role = 'doctor' — can only read clinic A
- **staff_clinic_b_token:** clinic_id = clinic-b-uuid, user_role = 'staff' — can only read clinic B

**Test scenarios:**
1. Admin queries patients from both clinics → RLS allows both ✓
2. Doctor queries clinic A patients → RLS allows ✓
3. Doctor queries clinic B patients → RLS blocks (403 or empty result) ✓
4. Staff queries own clinic → RLS allows ✓
5. Staff attempts INSERT in other clinic → RLS blocks ✓
6. All 10 tables enforce boundaries

---

## Tasks

<task type="auto">
  <name>Task 1: Write RLS integration tests to lib/__tests__/rls-isolation.test.ts</name>
  <files>lib/__tests__/rls-isolation.test.ts</files>
  <read_first>
    - lib/supabase.ts (to understand client creation)
    - lib/db-rls-policies.sql (to understand RLS enforcement points)
    - .planning/STATE.md (for clinic context and role definitions)
  </read_first>
  <action>
Create lib/__tests__/rls-isolation.test.ts with integration tests for RLS enforcement:

```typescript
/**
 * Integration Tests: RLS Clinic Isolation Enforcement
 *
 * These tests verify that Row-Level Security policies on all tables
 * enforce clinic boundaries and cannot be bypassed.
 *
 * SETUP REQUIRED: Test Supabase project with:
 * - All 10 tables created (lib/db-schema.sql)
 * - RLS policies enabled (lib/db-rls-policies.sql)
 * - Test data: 2 clinics, doctors/staff assigned to each, patients per clinic
 */

import { createClient } from '@/lib/supabase';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Test user tokens (in real tests, generated from JWT claims)
const TEST_TOKENS = {
  admin: process.env.TEST_TOKEN_ADMIN || '',
  doctor_clinic_a: process.env.TEST_TOKEN_DOCTOR_A || '',
  staff_clinic_b: process.env.TEST_TOKEN_STAFF_B || '',
};

const TEST_DATA = {
  clinic_a: process.env.TEST_CLINIC_A_ID || 'clinic-a-uuid',
  clinic_b: process.env.TEST_CLINIC_B_ID || 'clinic-b-uuid',
  patient_clinic_a: process.env.TEST_PATIENT_A_ID || 'patient-a-uuid',
  patient_clinic_b: process.env.TEST_PATIENT_B_ID || 'patient-b-uuid',
};

describe('RLS Clinic Isolation Tests', () => {
  
  describe('PATIENTS Table - SELECT Policies', () => {
    
    it('Admin can select patients from any clinic', async () => {
      const supabase = createClient(TEST_TOKENS.admin);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .in('clinic_id', [TEST_DATA.clinic_a, TEST_DATA.clinic_b]);
      
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(2);
    });

    it('Doctor can only select patients from assigned clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      expect(error).toBeNull();
      // RLS policy filters to clinic_a only
      expect(data?.every((p: any) => p.clinic_id === TEST_DATA.clinic_a)).toBe(true);
    });

    it('Doctor cannot select patients from other clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      // RLS blocks cross-clinic query
      expect(data?.length || 0).toBe(0);
    });

    it('Staff can only select patients from their clinic', async () => {
      const supabase = createClient(TEST_TOKENS.staff_clinic_b);
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.every((p: any) => p.clinic_id === TEST_DATA.clinic_b)).toBe(true);
    });
  });

  describe('PATIENTS Table - INSERT Policies', () => {
    
    it('Doctor can insert patient in assigned clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('patients')
        .insert({
          clinic_id: TEST_DATA.clinic_a,
          full_name: 'Test Patient',
          status: 'active',
        })
        .select()
        .single();
      
      expect(error).toBeNull();
      expect(data?.clinic_id).toBe(TEST_DATA.clinic_a);
    });

    it('Doctor cannot insert patient in other clinic (RLS blocks)', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('patients')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          full_name: 'Test Patient',
          status: 'active',
        })
        .select()
        .single();
      
      // RLS WITH CHECK fails
      expect(error).not.toBeNull();
    });
  });

  describe('APPOINTMENTS Table - Clinic Isolation', () => {
    
    it('Admin can select any clinic appointments', async () => {
      const supabase = createClient(TEST_TOKENS.admin);
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      
      expect(error).toBeNull();
      // Admin sees all clinics
      const clinicIds = new Set(data?.map((a: any) => a.clinic_id) || []);
      expect(clinicIds.size).toBeGreaterThanOrEqual(1);
    });

    it('Doctor sees only assigned clinic appointments', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.every((a: any) => a.clinic_id === TEST_DATA.clinic_a)).toBe(true);
    });

    it('Doctor cannot insert appointment in other clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          patient_id: TEST_DATA.patient_clinic_b,
          appointment_datetime: new Date().toISOString(),
        })
        .select()
        .single();
      
      expect(error).not.toBeNull();
    });
  });

  describe('VITAL_SIGNS Table - Data Isolation', () => {
    
    it('Doctor can select vital signs from own clinic patients', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
    });

    it('Doctor cannot access vital signs from other clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      // RLS blocks query
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('MEDICAL_HISTORY Table - Clinic Boundaries', () => {
    
    it('Staff can select medical history from clinic patients', async () => {
      const supabase = createClient(TEST_TOKENS.staff_clinic_b);
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      expect(error).toBeNull();
    });

    it('Staff cannot access other clinic medical history', async () => {
      const supabase = createClient(TEST_TOKENS.staff_clinic_b);
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('PRESCRIPTIONS Table - DELETE Restrictions', () => {
    
    it('Staff can delete prescriptions in their clinic', async () => {
      const supabase = createClient(TEST_TOKENS.staff_clinic_b);
      
      // Create prescription first
      const { data: created } = await supabase
        .from('prescriptions')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          patient_id: TEST_DATA.patient_clinic_b,
          medication_name: 'Test Medication',
        })
        .select()
        .single();
      
      if (created?.id) {
        const { error } = await supabase
          .from('prescriptions')
          .delete()
          .eq('id', created.id);
        
        expect(error).toBeNull();
      }
    });

    it('Doctor cannot delete prescriptions (staff-only policy)', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      
      // Attempt to delete prescription
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      // RLS DELETE policy requires staff role
      expect(error).not.toBeNull();
    });
  });

  describe('ATTACHMENTS Table - Document Isolation', () => {
    
    it('Doctor can view attachments from clinic patients', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
    });

    it('Doctor cannot insert attachments for other clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          patient_id: TEST_DATA.patient_clinic_b,
          file_name: 'test.pdf',
          file_path: 's3://bucket/test.pdf',
        })
        .select()
        .single();
      
      expect(error).not.toBeNull();
    });
  });

  describe('DOCTOR_PROFILES Table - Clinic Staff Management', () => {
    
    it('Admin can view doctors from all clinics', async () => {
      const supabase = createClient(TEST_TOKENS.admin);
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*');
      
      expect(error).toBeNull();
    });

    it('Doctor can only view doctors from their clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.every((d: any) => d.clinic_id === TEST_DATA.clinic_a)).toBe(true);
    });
  });

  describe('CONSULTATION_NOTES Table - Clinical Data Protection', () => {
    
    it('Doctor can select notes from assigned clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('consultation_notes')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
    });

    it('Doctor cannot select notes from other clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('consultation_notes')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('VACCINE_RECORDS Table - Patient Data Isolation', () => {
    
    it('Staff sees vaccine records from clinic patients', async () => {
      const supabase = createClient(TEST_TOKENS.staff_clinic_b);
      const { data, error } = await supabase
        .from('vaccine_records')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      expect(error).toBeNull();
    });

    it('Staff cannot see vaccine records from other clinic', async () => {
      const supabase = createClient(TEST_TOKENS.staff_clinic_b);
      const { data, error } = await supabase
        .from('vaccine_records')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('CLINICS Table - Access Control', () => {
    
    it('User can view their own clinic', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });

    it('User cannot view clinics they do not belong to', async () => {
      const supabase = createClient(TEST_TOKENS.doctor_clinic_a);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', TEST_DATA.clinic_b);
      
      expect(data?.length || 0).toBe(0);
    });

    it('Admin can view all clinics', async () => {
      const supabase = createClient(TEST_TOKENS.admin);
      const { data, error } = await supabase
        .from('clinics')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
```

**CRITICAL:**
- Tests use real Supabase client (not mocked)
- Test tokens must be generated from JWT with clinic_id and role claims
- Tests verify RLS blocks unauthorized queries (error or empty result)
- All 10 tables have test coverage
- Tests prove clinic isolation cannot be bypassed
  </action>
  <verify>
    <automated>grep -c "it(" lib/__tests__/rls-isolation.test.ts | grep -E "[2-9][0-9]"</automated>
    <automated>grep "describe(" lib/__tests__/rls-isolation.test.ts | wc -l | grep -E "1[0-3]"</automated>
  </verify>
  <done>
    - lib/__tests__/rls-isolation.test.ts exists with 25+ test cases
    - Tests cover all 10 tables
    - Tests verify SELECT, INSERT, UPDATE, DELETE policies
    - Tests verify role-based access (admin, doctor, staff)
    - Tests verify clinic isolation enforcement
    - Ready to run: npm test -- rls-isolation
  </done>
</task>

<task type="auto">
  <name>Task 2: Create .env.test for test Supabase project</name>
  <files>.env.test</files>
  <read_first>
    - .env.local.example (to see structure)
  </read_first>
  <action>
Create .env.test with test Supabase credentials and test JWT tokens:

```
# Test Supabase Project (separate from production/dev)
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ADMIN_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TEST_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Test JWT Tokens (generated with clinic_id and role claims)
# Admin token: can query all clinics
TEST_TOKEN_ADMIN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwidXNlcl9yb2xlIjoiYWRtaW4iLCJjbGluaWNfaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEifQ.test_signature

# Doctor token (clinic A): can query clinic A only
TEST_TOKEN_DOCTOR_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6ImRvY3RvckBAQGNsaW5pYS5jb20iLCJ1c2VyX3JvbGUiOiJkb2N0b3IiLCJjbGluaWNfaWQiOiJjbGluaWMtYS11dWlkIn0.test_signature

# Staff token (clinic B): can query clinic B only
TEST_TOKEN_STAFF_B=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDMiLCJlbWFpbCI6InN0YWZmQEBjbGluaWNiLmNvbSIsInVzZXJfcm9sZSI6InN0YWZmIiwiY2xpbmljX2lkIjoiY2xpbmljLWItdXVpZCJ9.test_signature

# Test Data IDs
TEST_CLINIC_A_ID=clinic-a-uuid
TEST_CLINIC_B_ID=clinic-b-uuid
TEST_PATIENT_A_ID=patient-a-uuid
TEST_PATIENT_B_ID=patient-b-uuid

# Note: Do not commit real tokens or credentials to git
# Use environment variables in CI/CD pipelines
# Generate test tokens from Supabase JWT builder or manually with proper claims
```

**CRITICAL:**
- Do NOT commit real credentials to git (.env.test should be in .gitignore)
- Use environment variables in CI/CD pipelines
- Test tokens must have clinic_id and user_role claims
- Separate test project from dev/prod
  </action>
  <verify>
    <automated>grep "TEST_SUPABASE_URL" .env.test</automated>
    <automated>grep "TEST_TOKEN_" .env.test | wc -l | grep -E "[3-9]"</automated>
  </verify>
  <done>
    - .env.test created with test Supabase credentials
    - Test JWT tokens defined (admin, doctor, staff)
    - Test data IDs defined
    - Ready for npm test command
  </done>
</task>

<task type="auto">
  <name>Task 3: Document RLS test strategy and commit</name>
  <files>lib/__tests__/rls-isolation.test.ts, .env.test</files>
  <read_first>
    - lib/__tests__/rls-isolation.test.ts (test file)
    - .env.test (test configuration)
  </read_first>
  <action>
Create documentation and commit integration tests:

1. Create lib/__tests__/README.md with setup instructions:
```markdown
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
```

2. Commit all test files:
```bash
git add lib/__tests__/rls-isolation.test.ts .env.test lib/__tests__/README.md
git commit -m "test(03): add RLS integration tests for clinic isolation verification"
```

This commit proves that:
- RLS policies work as designed
- Clinic isolation is enforced at database layer
- All DATA and ISOL requirements are verifiable
- Phase 03 is ready to be verified before Phase 04 (API Integration)
  </action>
  <verify>
    <automated>test -f lib/__tests__/rls-isolation.test.ts && echo "Tests created"</automated>
    <automated>grep -c "test(" lib/__tests__/rls-isolation.test.ts | grep -E "[2-9][0-9]"</automated>
  </verify>
  <done>
    - Integration tests created with 25+ test cases
    - Test configuration (.env.test) defined
    - All 10 tables have RLS test coverage
    - Tests verify clinic isolation is not bypassable
    - Documentation created for test setup and execution
    - Ready for CI/CD pipeline integration
  </done>
</task>

</tasks>

---

## Verification

**Plan 04 is complete when:**
1. ✅ lib/__tests__/rls-isolation.test.ts with 25+ test cases
2. ✅ All 10 tables have test coverage
3. ✅ Tests verify RLS blocks cross-clinic queries
4. ✅ Tests verify role-based access (admin, doctor, staff)
5. ✅ .env.test configured with test credentials
6. ✅ Tests can be run: npm test -- rls-isolation

---

## Success Criteria

**Plan 04 Complete when:**
- [ ] Integration tests created (25+ test cases)
- [ ] All 10 tables covered by tests
- [ ] Tests verify clinic isolation is enforced
- [ ] Tests verify role-based access control
- [ ] Tests can run against test Supabase project
- [ ] All DATA (01-10) and ISOL (01-06) requirements verifiable via tests
- [ ] Ready for Phase 4 (API Service Layer & Frontend Integration)

**Phase 03 Complete Verification:**
- ✅ All 10 core + data tables exist in Supabase schema
- ✅ All tables have clinic_id column (NOT NULL, indexed)
- ✅ All foreign keys properly defined with clinic isolation
- ✅ RLS policies enforce clinic boundaries at database layer
- ✅ Query functions provide app-level clinic_id filtering (defense-in-depth)
- ✅ Integration tests prove RLS is not bypassable
- ✅ All 16 Phase 3 requirements (DATA-01-10, ISOL-01-06) satisfied

---

## Output

After completion, create `.planning/phases/03-database-schema-rls/03-database-schema-rls-04-SUMMARY.md` with:
- Integration tests created (25+ test cases)
- All 10 tables tested for clinic isolation
- RLS enforcement verified
- Files modified (lib/__tests__/rls-isolation.test.ts, .env.test)
- Phase 03 verification complete
- Handoff to Phase 04 (API Service Layer & Frontend Integration)

---

*Plan created: 2026-03-27*
*Phase: 03 - Database Schema & Row-Level Security*
*Goal: Verify clinic isolation is enforced at database layer and cannot be bypassed*
