# ⚠️ CRITICAL: Manual Supabase Setup Required

**Status:** Tables not yet created in Supabase. You must run the SQL manually.

## What to Do

### Step 1: Create Tables & Indexes

1. Go to: https://supabase.com/dashboard/project/knbnvwlmxbidfiixnylg/sql
2. Click **"New Query"**
3. Copy the entire content from **`.supabase/001-schema.sql`**
4. Paste into the SQL editor
5. Click **"Run"**
6. Wait for completion ✅

### Step 2: Enable RLS Policies

1. Click **"New Query"** again
2. Copy the entire content from **`.supabase/002-rls-policies.sql`**
3. Paste into the SQL editor
4. Click **"Run"**
5. Wait for completion ✅

### Step 3: Verify Tables Created

Run this verification query in Supabase SQL editor:

```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected: **10** tables

### Step 4: Seed Test Data

Once tables are confirmed, run this command:

```bash
cd /Users/sgonzalezfx/Desktop/MedConnect
node scripts/setup-complete.js
```

This will create:
- 1 test clinic
- 3 test patients
- 3 test appointments

---

## ⏱️ Timeline

- **Step 1-2:** ~30 seconds
- **Step 3:** Instant
- **Step 4:** ~5 seconds

**Total:** ~1 minute

---

## 🔒 Security Notes

✅ `.env.local` is in `.gitignore` — credentials safe  
✅ No secrets in git history  
✅ RLS policies enforce clinic isolation automatically  
✅ All data encrypted at rest in Supabase

---

## After Setup

Once tables exist, all features work:
- ✅ Dashboard loads real appointments
- ✅ Patient lists show real data
- ✅ Forms create patients/appointments in database
- ✅ Clinic isolation enforced by RLS
- ✅ API routes handle real database queries

**Current blockers:** Tables missing → Cannot execute API queries → Forms show errors

**After manual SQL:** All blockers removed → v1.0 fully functional
