# Plan 04 Database Setup - Quick Reference

## ✅ What's Done

- [x] Schema: 10 tables created, 21 indexes, UUID primary keys
- [x] RLS: 41 policies enforcing clinic isolation at PostgreSQL layer
- [x] Test Data: 1 clinic, 4 patients, 3 appointments ready to seed
- [x] Automation: `npm run setup:db` script ready
- [x] Documentation: Complete setup guide with verification queries

**Commit:** `35c9e4d` - setup(database): prepare Supabase schema, RLS policies, and test data seeding for Plan 04 checkpoint

---

## 🚀 Deploy Now

```bash
# Set SUPABASE_SERVICE_ROLE_KEY in .env.local first

npm run setup:db
```

**Time:** 30-60 seconds  
**Includes:** Schema creation, RLS policies, test data seeding, verification

---

## 📁 Key Files

| File | Purpose | Size |
|------|---------|------|
| lib/db-schema.sql | 10 tables, 21 indexes | 10 KB |
| lib/db-rls-policies.sql | 41 RLS policies | 9 KB |
| lib/db-seed-test-data.sql | Manual test data SQL | 1.5 KB |
| scripts/setup-database.js | Automation script | 5 KB |
| .planning/DATABASE_SETUP.md | Complete guide | 8 KB |

---

## ✓ Verify Setup

After running `npm run setup:db`, verify:

```sql
SELECT COUNT(*) FROM clinics;        -- Expected: 1
SELECT COUNT(*) FROM patients;       -- Expected: 4
SELECT COUNT(*) FROM appointments;   -- Expected: 3
SELECT COUNT(*) FROM pg_policies;    -- Expected: 41
```

Or run all verification queries from `.planning/DATABASE_SETUP.md`

---

## 🎯 Next: Plan 04 Checkpoint

1. Run deployment: `npm run setup:db`
2. Verify with queries above
3. Execute Plan 04 tests
4. Checkpoint should pass ✅

---

## 📞 Need Help?

- **Setup Guide:** `.planning/DATABASE_SETUP.md`
- **Troubleshooting:** See "Troubleshooting" section in setup guide
- **Schema Details:** See comments in `lib/db-schema.sql`
- **RLS Details:** See comments in `lib/db-rls-policies.sql`

---

## Database Info

**Project Ref:** knbnvwlmxbidfiixnylg  
**URL:** https://knbnvwlmxbidfiixnylg.supabase.co  
**MCP:** https://mcp.supabase.com/mcp?project_ref=knbnvwlmxbidfiixnylg

---

## Status

✅ **READY TO DEPLOY** — All files prepared, documented, and committed
