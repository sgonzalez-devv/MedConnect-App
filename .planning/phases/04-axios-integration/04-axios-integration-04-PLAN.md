---
phase: 04-axios-integration
plan: 04
type: checkpoint:human-verify
wave: 3
depends_on: [04-axios-integration-02, 04-axios-integration-03]
files_modified: []
autonomous: false
requirements: [AXIOS-05]
user_setup: []

must_haves:
  truths:
    - "All /api/* fetch calls have been migrated to axios"
    - "Remaining fetch calls are only for non-API purposes (external URLs)"
    - "Axios interceptors handle 401 and 403 errors correctly"
    - "Application functions identically before and after migration"
  artifacts: []
  key_links: []

---

# Plan 4: Migration Verification & Cleanup

Verify that all API calls have been migrated from fetch to axios, and test the application to ensure no regressions.

**Purpose:** Ensure complete migration and functional verification.

**Output:** Verified migration with no remaining /api fetch calls.

**Depends on:** Plans 02 and 03 (all pages migrated)

---

## Tasks

<task type="auto">
  <name>Task 1: Audit remaining fetch calls</name>
  <action>
Search the entire codebase for remaining fetch calls:

```bash
grep -rn "fetch(" --include="*.tsx" --include="*.ts" app/ lib/ | grep -v "node_modules"
```

Categorize each result:
1. **API calls to migrate** — fetch('/api/*') calls still in codebase
2. **External URLs** — fetch to external APIs (keep as-is)
3. **Supabase client** — fetch used internally by @supabase/supabase-js (keep as-is)

For any API calls found:
1. Identify which file and line
2. Determine if it's a new call added after the migration
3. Migrate to apiClient if needed
  </action>
  <verify>
    <automated>
      grep -rn "fetch(" --include="*.tsx" --include="*.ts" app/\(app\)/ lib/ 2>/dev/null | grep -v "node_modules" | grep "/api/" || echo "CLEAN: No /api/ fetch calls found"
    </automated>
  </verify>
  <done>All /api/* fetch calls migrated; only external URLs and Supabase internal fetch remain</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify application functionality</name>
  <what-built>Phase 4: Axios Integration — All pages migrated from fetch to axios</what-built>
  <how-to-verify>
## Test the migrated application

1. **Start the development server:**
   ```
   pnpm dev
   ```

2. **Test Dashboard:**
   - Navigate to /dashboard
   - Verify appointments load correctly
   - Check browser console for errors

3. **Test Patient List:**
   - Navigate to /pacientes
   - Verify patients load and search works
   - Check browser console for errors

4. **Test Patient Detail:**
   - Click on a patient to view details
   - Verify patient data loads correctly
   - Check browser console for errors

5. **Test New Patient Form:**
   - Navigate to /pacientes/nuevo
   - Fill in test patient data
   - Submit and verify success toast appears
   - Verify redirect to patient list
   - Check browser console for errors

6. **Test New Appointment Form:**
   - Navigate to /calendario/nueva-cita
   - Fill in test appointment data
   - Submit and verify success toast appears
   - Verify redirect to calendar
   - Check browser console for errors

7. **Test Error Handling:**
   - Open browser DevTools > Network tab
   - Block a request to simulate error
   - Verify error toast appears with formatted message

8. **Test Session Expiry (401):**
   - Clear session cookies manually
   - Refresh any page
   - Verify redirect to login page
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

<task type="auto">
  <name>Task 3: Final cleanup and documentation</name>
  <action>
1. **Update lib/api-client.ts exports if needed** based on actual usage patterns discovered during migration

2. **Add a migration guide comment** to lib/api-client.ts:
   ```typescript
   /**
    * Axios API Client
    * 
    * This client is configured with interceptors for:
    * - Automatic auth token attachment
    * - 401 handling (session expiry → redirect to login)
    * - 403 handling (permission denied → toast)
    * - Automatic retry for 5xx errors (GET requests only)
    * 
    * Migration from fetch:
    * Before: fetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } })
    * After:  apiClient.get('/api/patients')
    * 
    * @requirement AXIOS-01, AXIOS-02, AXIOS-03, AXIOS-04, AXIOS-05
    */
   ```

3. **Verify package.json** has axios listed correctly

4. **Run a final verification** to ensure no regressions:
   ```bash
   pnpm build
   ```
  </action>
  <verify>
    <automated>
      pnpm build 2>&1 | tail -20
    </automated>
  </verify>
  <done>Migration complete; all pages use axios; build passes; application functions correctly</done>
</task>

</tasks>

<verification>
- [ ] No /api/* fetch calls remain in frontend code
- [ ] All pages use apiClient for API calls
- [ ] Dashboard, patients, calendar, and forms all work correctly
- [ ] Error handling shows formatted messages
- [ ] 401 responses redirect to login
- [ ] Build passes without errors
</verification>

<success_criteria>
- All API calls use axios instead of fetch
- Application functions identically to before migration
- Error handling works correctly
- Session expiry redirects to login
- Build passes
- Human verification complete (approved)
</success_criteria>

<output>
After completion, create `.planning/phases/04-axios-integration/04-axios-integration-04-SUMMARY.md`
</output>
