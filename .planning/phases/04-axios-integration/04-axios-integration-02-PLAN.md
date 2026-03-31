---
phase: 04-axios-integration
plan: 02
type: execute
wave: 2
depends_on: [04-axios-integration-01]
files_modified: [
  "app/(app)/dashboard/page.tsx",
  "app/(app)/pacientes/page.tsx",
  "app/(app)/pacientes/[id]/page.tsx"
]
autonomous: true
requirements: [AXIOS-05]
user_setup: []

must_haves:
  truths:
    - "Dashboard page uses axios instead of fetch for API calls"
    - "Patient list page uses axios for fetching patients"
    - "Patient detail page uses axios for fetching patient data"
    - "All axios calls maintain existing error handling behavior"
    - "Loading states and error toasts work identically to before migration"
  artifacts:
    - path: "app/(app)/dashboard/page.tsx"
      provides: "Dashboard with axios-based API calls"
      min_lines: 450
    - path: "app/(app)/pacientes/page.tsx"
      provides: "Patient list with axios-based API calls"
      min_lines: 380
  key_links:
    - from: "dashboard page"
      to: "lib/api-client.ts"
      via: "import { apiClient }"
      pattern: "import.*apiClient.*from.*api-client"
    - from: "pacientes page"
      to: "lib/api-client.ts"
      via: "import { apiClient }"
      pattern: "import.*apiClient.*from.*api-client"

---

# Plan 2: Migrate Dashboard and Patient Pages to Axios

Migrate the dashboard and patient list/detail pages from native `fetch` to the `apiClient` from `lib/api-client.ts`. This plan focuses on read operations (GET requests).

**Purpose:** Demonstrate the migration pattern and migrate core read-only pages.

**Output:** Updated dashboard, patient list, and patient detail pages using axios.

**Depends on:** Plan 01 (axios client must be configured before migrating pages)

---

## Context

### Migration Pattern

**Before (fetch):**
```typescript
const res = await fetch("/api/patients", {
  headers: { 'Authorization': `Bearer ${session?.access_token}` },
})
if (!res.ok) {
  const errData = await res.json().catch(() => ({}))
  throw new Error(errData.error || `HTTP ${res.status}`)
}
const json = await res.json()
setPatients(json.data || [])
```

**After (axios):**
```typescript
try {
  const { data } = await apiClient.get('/api/patients')
  setPatients(data?.data || [])
} catch (error) {
  const message = formatErrorMessage(error, 'Fetching patients')
  toast.error(message)
}
```

### Key Changes:
1. Import `apiClient` instead of using native fetch
2. Use `apiClient.get()` / `apiClient.post()` etc. instead of `fetch()`
3. Response is `{ data }` destructured, not `res.json()`
4. Error handling via `catch` block with `formatErrorMessage()`
5. No need to manually check `res.ok` — axios throws on non-2xx

---

## Tasks

<task type="auto" tdd="true">
  <name>Task 1: Migrate dashboard page to axios</name>
  <files>app/(app)/dashboard/page.tsx</files>
  <behavior>
    - Dashboard fetches today's appointments using apiClient.get()
    - Dashboard fetches patient count using apiClient.get()
    - Error handling shows toast with formatted message on failure
    - Loading states work identically to before
    - 401 response triggers logout and redirect
  </behavior>
  <action>
Read the current dashboard page to identify all fetch calls, then migrate:

1. Add import at top of file:
   ```typescript
   import { apiClient } from '@/lib/api-client'
   ```

2. Find all fetch calls (typically useEffect hooks):

   **Example pattern for appointments:**
   ```typescript
   // BEFORE:
   const res = await fetch(`/api/appointments?fromDate=${today}&toDate=${today}`, {
     headers: { 'Authorization': `Bearer ${session?.access_token}` },
   })
   if (!res.ok) {
     const errData = await res.json().catch(() => ({}))
     throw new Error(errData.error || `HTTP ${res.status}`)
   }
   const json = await res.json()
   setAppointments(json.data || [])
   
   // AFTER:
   const { data } = await apiClient.get(`/api/appointments?fromDate=${today}&toDate=${today}`)
   setAppointments(data?.data || [])
   ```

   **Keep the try/catch/finally structure** — only change the HTTP call inside.

3. Keep existing imports unchanged (useAuth, toast, formatErrorMessage, etc.)

4. Ensure error handling in catch block still calls formatErrorMessage():
   ```typescript
   } catch (err) {
     const message = formatErrorMessage(err, 'Fetching dashboard data')
     toast.error(message)
   }
   ```

5. Keep loading state management (setLoading(true/false)) unchanged

6. Do NOT change any UI rendering logic — only the data fetching

Verify: Search for any remaining `fetch(` calls and ensure they're only for non-API calls (e.g., external URLs).
  </action>
  <verify>
    <automated>
      grep -q "import.*apiClient.*from.*api-client" app/\(app\)/dashboard/page.tsx && echo "PASS: Import added" || echo "FAIL"
      grep -c "fetch(" app/\(app\)/dashboard/page.tsx | xargs -I {} test {} -le 1 && echo "PASS: fetch calls migrated" || echo "WARN: Some fetch calls remain"
    </automated>
  </verify>
  <done>Dashboard page uses apiClient.get() instead of fetch(); all fetch calls for /api/* routes replaced; error handling preserves existing toast messages; loading states unchanged</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Migrate patient list page to axios</name>
  <files>app/(app)/pacientes/page.tsx</files>
  <behavior>
    - Patient list fetches patients using apiClient.get('/api/patients')
    - Search filter applied to fetched data (client-side)
    - Error handling shows toast with formatted message
    - Loading states work identically to before
    - View mode toggle (list/grid) unchanged
  </behavior>
  <action>
Read the current patient list page to identify all fetch calls, then migrate:

1. Add import at top of file:
   ```typescript
   import { apiClient } from '@/lib/api-client'
   ```

2. Find the fetchPatients function (in useEffect):

   **Current pattern (from context):**
   ```typescript
   const res = await fetch("/api/patients", {
     headers: { 'Authorization': `Bearer ${session?.access_token}` },
   })
   if (!res.ok) {
     const errData = await res.json().catch(() => ({}))
     throw new Error(errData.error || `HTTP ${res.status}`)
   }
   const json = await res.json()
   setPatients(json.data || [])
   ```

   **Migrate to:**
   ```typescript
   const { data } = await apiClient.get('/api/patients')
   setPatients(data?.data || [])
   ```

3. Keep the try/catch structure:
   ```typescript
   try {
     setLoading(true)
     const { data } = await apiClient.get('/api/patients')
     setPatients(data?.data || [])
   } catch (err) {
     const message = formatErrorMessage(err, 'Fetching patients')
     toast.error(message)
   } finally {
     setLoading(false)
   }
   ```

4. Verify search/filter logic still works — it operates on state, not the API call

5. Do NOT change the view mode toggle logic (list/grid)

6. Keep all existing imports; only add the apiClient import
  </action>
  <verify>
    <automated>
      grep -q "import.*apiClient.*from.*api-client" app/\(app\)/pacientes/page.tsx && echo "PASS: Import added" || echo "FAIL"
      grep -c "fetch(" app/\(app\)/pacientes/page.tsx | xargs -I {} test {} -le 1 && echo "PASS: fetch calls migrated" || echo "WARN: Some fetch calls remain"
    </automated>
  </verify>
  <done>Patient list page uses apiClient.get() instead of fetch(); patient search/filter logic unchanged; error handling preserves toast messages; loading states unchanged</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Migrate patient detail page to axios</name>
  <files>app/(app)/pacientes/[id]/page.tsx</files>
  <behavior>
    - Patient detail fetches patient data using apiClient.get()
    - Clinic isolation check in client-side code preserved
    - Error handling shows toast with formatted message
    - Loading states work identically to before
  </behavior>
  <action>
Read the current patient detail page to identify all fetch calls, then migrate:

1. Add import at top of file:
   ```typescript
   import { apiClient } from '@/lib/api-client'
   ```

2. Find all fetch calls in useEffect hooks (typically for patient data, vital signs, etc.)

3. Migrate each fetch call pattern:

   **Example pattern:**
   ```typescript
   // BEFORE:
   const res = await fetch(`/api/patients/${id}`, {
     headers: { 'Authorization': `Bearer ${session?.access_token}` },
   })
   if (!res.ok) {
     const errData = await res.json().catch(() => ({}))
     throw new Error(errData.error || `HTTP ${res.status}`)
   }
   const data = await res.json()
   
   // AFTER:
   const { data } = await apiClient.get(`/api/patients/${id}`)
   ```

4. Keep the clinic isolation check logic:
   ```typescript
   if (patientData.clinicId !== user.clinic_id) {
     toast.error("You don't have access to this patient's records")
     router.push('/pacientes')
     return
   }
   ```

5. Keep all error handling in catch blocks using formatErrorMessage()

6. Preserve any loading state management
  </action>
  <verify>
    <automated>
      grep -q "import.*apiClient.*from.*api-client" app/\(app\)/pacientes/\[id\]/page.tsx && echo "PASS: Import added" || echo "FAIL"
      grep -c "fetch(" app/\(app\)/pacientes/\[id\]/page.tsx | xargs -I {} test {} -le 1 && echo "PASS: fetch calls migrated" || echo "WARN: Some fetch calls remain"
    </automated>
  </verify>
  <done>Patient detail page uses apiClient.get() instead of fetch(); clinic isolation check preserved; error handling preserves toast messages; all data fetching migrated</done>
</task>

</tasks>

<verification>
- [ ] Dashboard page imports apiClient and uses apiClient.get()
- [ ] Patient list page imports apiClient and uses apiClient.get()
- [ ] Patient detail page imports apiClient and uses apiClient.get()
- [ ] All fetch calls for /api/* routes replaced with axios calls
- [ ] Error handling uses formatErrorMessage() consistently
- [ ] Loading states preserved
- [ ] Clinic isolation checks preserved
- [ ] No regression in functionality
</verification>

<success_criteria>
- Dashboard displays appointments correctly (verified visually)
- Patient list displays and filters patients correctly
- Patient detail page loads patient data correctly
- Error toasts appear on failures (can test with offline mode)
- 401 responses redirect to login
- No console errors on page loads
</success_criteria>

<output>
After completion, create `.planning/phases/04-axios-integration/04-axios-integration-02-SUMMARY.md`
</output>
