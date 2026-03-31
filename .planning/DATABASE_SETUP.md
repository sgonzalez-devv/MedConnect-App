# Database Setup for Plan 04 Checkpoint Retesting

## Overview
This document provides a complete setup guide for the MedConnect Supabase database to enable Plan 04 checkpoint retesting. All schema files, setup scripts, and verification procedures are ready.

## Quick Start

### Option 1: Automated Setup (Node.js)
```bash
npm run setup:db
```
**Requirements:** SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

### Option 2: Manual Setup (Supabase Dashboard)
1. Go to: https://knbnvwlmxbidfiixnylg.supabase.co/dashboard
2. SQL Editor → New Query → Paste lib/db-schema.sql → Execute
3. SQL Editor → New Query → Paste lib/db-rls-policies.sql → Execute
4. Table Editor → Insert test data as documented below

## Database Architecture

### 10 Tables Created
| Table | Purpose | Clinic Isolation |
|-------|---------|------------------|
| clinics | Clinic records (isolation boundary) | N/A |
| patients | Patient records | clinic_id NOT NULL |
| doctor_profiles | Doctor/staff records | clinic_id NOT NULL |
| appointments | Appointment records | clinic_id NOT NULL |
| consultation_notes | Doctor notes | clinic_id NOT NULL |
| vital_signs | Patient vital measurements | clinic_id NOT NULL |
| medical_history | Patient medical history | clinic_id NOT NULL |
| vaccine_records | Immunization records | clinic_id NOT NULL |
| attachments | Document storage metadata | clinic_id NOT NULL |
| prescriptions | Medication prescriptions | clinic_id NOT NULL |

### Security: Row-Level Security (RLS)
- **41 RLS policies** enforcing clinic isolation at PostgreSQL layer
- **Role-based access control:**
  - Admins: Can view all clinics and records
  - Doctors/Staff: Can only view/edit records from their clinic
  - Delete operations: Staff only (doctors cannot delete)

### Indexes (21 Total)
Performance optimization on:
- clinic_id (all tables)
- patient_id (patient-related tables)
- doctor_id (doctor-related tables)
- status fields (appointments, prescriptions)
- name fields (clinics, patients)

## Test Data Specification

### Test Clinic
```json
{
  "id": "[UUID generated]",
  "name": "Test Medical Clinic",
  "address": "123 Health St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "country": "USA",
  "phone": "(555) 123-4567",
  "email": "info@testclinic.com",
  "created_at": "[CURRENT_TIMESTAMP]",
  "updated_at": "[CURRENT_TIMESTAMP]"
}
```

### Test Patients (4 total)
| Name | DOB | Gender | Status |
|------|-----|--------|--------|
| John Smith | 1985-06-15 | M | active |
| Jane Doe | 1990-03-22 | F | active |
| Robert Johnson | 1978-11-08 | M | active |
| Emily Wilson | 1995-01-30 | F | active |

**Common fields for all:**
- email: [firstname.lastname@example.com]
- phone: (555) 987-6543
- clinic_id: [test clinic UUID]
- status: active

### Test Appointments (3 total)
| Patient | Date | Duration | Reason | Doctor |
|---------|------|----------|--------|--------|
| John Smith | +1 day | 30 min | Annual checkup | NULL |
| Jane Doe | +2 days | 45 min | Follow-up consultation | NULL |
| Robert Johnson | +3 days | 30 min | Dental checkup | NULL |

## Verification Queries

After setup, run these queries in Supabase SQL Editor to verify:

### 1. Table Existence
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- Expected: 10 rows (all tables listed above)
```

### 2. Clinic Verification
```sql
SELECT id, name, city, country 
FROM clinics 
WHERE name = 'Test Medical Clinic';
-- Expected: 1 row with clinic data
```

### 3. Patient Count
```sql
SELECT COUNT(*) as patient_count 
FROM patients 
WHERE clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic');
-- Expected: 4
```

### 4. Appointment Verification
```sql
SELECT a.id, a.appointment_datetime, p.full_name, a.reason_for_visit
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic')
ORDER BY a.appointment_datetime;
-- Expected: 3 rows with appointment details
```

### 5. Clinic Isolation Check
```sql
SELECT COUNT(*) as isolated_patients
FROM patients 
WHERE clinic_id = (SELECT id FROM clinics WHERE name = 'Test Medical Clinic');
-- Expected: 4 (all patients belong to this clinic only)
```

### 6. RLS Policy Verification
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
ORDER BY tablename, policyname;
-- Expected: 41 rows (one policy per action per table)
```

## Files Reference

### Schema Files
- **lib/db-schema.sql** (10,207 bytes)
  - 10 CREATE TABLE statements
  - 21 CREATE INDEX statements
  - All tables include created_at/updated_at timestamps
  - All tables use UUID primary keys with gen_random_uuid()

- **lib/db-rls-policies.sql** (9,095 bytes)
  - ALTER TABLE ... ENABLE ROW LEVEL SECURITY (10 tables)
  - CREATE POLICY statements (41 total)
  - Clinic isolation enforcement
  - Role-based access control (admin/staff/doctor)

### Setup Scripts
- **scripts/setup-database.js** (Node.js setup automation)
  - Creates Supabase client with service role key
  - Reads and executes schema SQL
  - Seeds test data programmatically
  - Verifies data integrity with COUNT queries
  - Provides detailed console output

### Configuration
- **package.json** (updated)
  - Added "setup:db": "node scripts/setup-database.js" script
  - Allows running: npm run setup:db

## Troubleshooting

### "Tables already exist" Error
- Schema uses `CREATE TABLE IF NOT EXISTS`
- Safe to re-run without clearing existing data
- To reset: Use Supabase dashboard to drop tables or delete records

### RLS Policy Errors
- If policies conflict, drop first:
  ```sql
  DROP POLICY IF EXISTS policy_name ON table_name;
  ```
- Policies can be re-created multiple times
- Use dashboard's "Policies" view to see all active policies

### Foreign Key Constraint Errors
- Ensure clinic is created before patients
- Setup script handles this automatically
- Manual setup: Create clinic first, then patients, then appointments

### Missing Service Role Key
- Get from: Supabase Dashboard → Settings → API → Service Role (SECRET)
- Add to .env.local: `SUPABASE_SERVICE_ROLE_KEY=...`
- Never commit this to version control

## Success Indicators

After setup completion, you should have:

✓ 10 tables visible in Supabase Table Editor  
✓ 21 indexes created (query performance optimized)  
✓ 41 RLS policies enforcing clinic isolation  
✓ 1 test clinic record  
✓ 4 test patient records  
✓ 3 test appointment records  
✓ All clinic_id foreign keys set correctly  
✓ RLS functioning (test user sees only their clinic's data)  

## Plan 04 Checkpoint Requirements

This setup enables Plan 04 checkpoint to:
- [x] Connect to database successfully
- [x] Query patient records with clinic isolation
- [x] Verify RLS policies working
- [x] Test appointment scheduling flow
- [x] Validate API service integration with database

## Next Steps

1. **Execute Setup:**
   - Use automated: `npm run setup:db`
   - Or manual: Supabase Dashboard SQL Editor

2. **Verify Installation:**
   - Run verification queries (see section above)
   - Check row counts match expectations

3. **Test RLS:**
   - Create test user with specific clinic_id claim
   - Verify cannot access other clinics' data

4. **Proceed with Plan 04 Tests:**
   - Run checkpoint verification
   - Test API endpoints with test data
   - Verify database connectivity

## Database Connection Info

- **Project Reference:** knbnvwlmxbidfiixnylg
- **Supabase URL:** https://knbnvwlmxbidfiixnylg.supabase.co
- **MCP Endpoint:** https://mcp.supabase.com/mcp?project_ref=knbnvwlmxbidfiixnylg

## Questions?

Refer to:
- Schema details: lib/db-schema.sql (commented throughout)
- RLS policies: lib/db-rls-policies.sql (documented per policy)
- Setup automation: scripts/setup-database.js (inline comments)
