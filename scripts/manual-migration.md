# Manual Supabase Migration Instructions

Since the RPC methods aren't working reliably, follow these steps in the Supabase dashboard:

## Steps

1. Go to: https://supabase.com/dashboard/project/knbnvwlmxbidfiixnylg/sql
2. Click "New Query"
3. Paste the entire content of `lib/db-schema.sql`
4. Click "Run"
5. Verify all tables are created (check "Tables" in left sidebar)

Then:

6. Create another new query
7. Paste the entire content of `lib/db-rls-policies.sql`
8. Click "Run"
9. Verify RLS is enabled on all tables

## Quick Verification

After running both queries, execute this in a new query:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should return 10 tables:
- appointments
- attachments
- clinic_profiles
- clinics
- consultation_notes
- medical_history
- patients
- prescriptions
- vaccine_records
- vital_signs
