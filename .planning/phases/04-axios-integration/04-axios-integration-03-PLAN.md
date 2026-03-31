---
phase: 04-axios-integration
plan: 03
type: execute
wave: 2
depends_on: [04-axios-integration-01]
files_modified: [
  "app/(app)/pacientes/nuevo/page.tsx",
  "app/(app)/calendario/nueva-cita/page.tsx",
  "app/(app)/calendario/page.tsx"
]
autonomous: true
requirements: [AXIOS-05]
user_setup: []

must_haves:
  truths:
    - "New patient form submits using apiClient.post()"
    - "New appointment form submits using apiClient.post()"
    - "Calendar page fetches appointments using apiClient.get()"
    - "All write operations maintain existing validation and error handling"
    - "Success redirects work identically to before"
  artifacts:
    - path: "app/(app)/pacientes/nuevo/page.tsx"
      provides: "New patient form with axios submission"
      min_lines: 420
    - path: "app/(app)/calendario/nueva-cita/page.tsx"
      provides: "New appointment form with axios submission"
      min_lines: 400
  key_links:
    - from: "new patient form"
      to: "lib/api-client.ts"
      via: "import { apiClient }"
      pattern: "import.*apiClient.*from.*api-client"
    - from: "new appointment form"
      to: "lib/api-client.ts"
      via: "import { apiClient }"
      pattern: "import.*apiClient.*from.*api-client"

---

# Plan 3: Migrate Forms and Calendar to Axios

Migrate the new patient form, new appointment form, and calendar page from native `fetch` to axios. This plan focuses on write operations (POST) and read operations for the calendar.

**Purpose:** Complete the migration of all core pages from fetch to axios.

**Output:** Updated forms and calendar page using axios for all API calls.

**Depends on:** Plan 01 (axios client must be configured)

---

## Context

### Migration Pattern for POST

**Before (fetch):**
```typescript
const res = await fetch('/api/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify(formData),
})
if (!res.ok) {
  const errData = await res.json().catch(() => ({}))
  throw new Error(errData.error || `HTTP ${res.status}`)
}
const json = await res.json()
toast.success('Patient created successfully')
router.push('/pacientes')
```

**After (axios):**
```typescript
const { data } = await apiClient.post('/api/patients', formData)
toast.success('Patient created successfully')
router.push('/pacientes')
```

### Key Differences:
1. `apiClient.post()` handles JSON serialization automatically when passed an object
2. `apiClient.post()` sets Content-Type header automatically
3. No need for manual `res.ok` check — axios throws on non-2xx
4. Response is `{ data }` directly, not nested in `json.data`

---

## Tasks

<task type="auto" tdd="true">
  <name>Task 1: Migrate new patient form to axios</name>
  <files>app/(app)/pacientes/nuevo/page.tsx</files>
  <behavior>
    - Form submission uses apiClient.post() instead of fetch
    - Validation errors from server displayed to user
    - 401 response triggers logout and redirect
    - 403 response shows permission denied toast
    - Success shows toast and redirects to patient list
  </behavior>
  <action>
Read the current new patient form to identify the submission handler, then migrate:

1. Add import at top of file:
   ```typescript
   import { apiClient } from '@/lib/api-client'
   ```

2. Find the form submission handler (typically handleSubmit with fetch):

   **Current pattern:**
   ```typescript
   const handleSubmit = async (data: PatientFormData) => {
     try {
       setSubmitting(true)
       
       const res = await fetch('/api/patients', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${session?.access_token}`,
         },
         body: JSON.stringify(data),
       })
       
       if (!res.ok) {
         const errData = await res.json().catch(() => ({}))
         
         // Handle 401
         if (res.status === 401) {
           toast.error('Session expired. Please log in again.')
           await signOut()
           router.push('/auth/login')
           return
         }
         
         // Handle 403
         if (res.status === 403) {
           toast.error("You don't have permission to create patients.")
           return
         }
         
         throw new Error(errData.error || `HTTP ${res.status}`)
       }
       
       toast.success('Patient created successfully')
       router.push('/pacientes')
     } catch (err) {
       const message = formatErrorMessage(err, 'Creating patient')
       toast.error(message)
     } finally {
       setSubmitting(false)
     }
   }
   ```

   **Migrate to:**
   ```typescript
   const handleSubmit = async (data: PatientFormData) => {
     try {
       setSubmitting(true)
       
       await apiClient.post('/api/patients', data)
       
       toast.success('Patient created successfully')
       router.push('/pacientes')
     } catch (err) {
       // The apiClient interceptors handle 401/403
       // Only need to format the error message for the user
       const message = formatErrorMessage(err, 'Creating patient')
       toast.error(message)
     } finally {
       setSubmitting(false)
     }
   }
   ```

3. **Key changes:**
   - Remove manual 401/403 handling — interceptors handle this automatically
   - Remove JSON.stringify — axios handles serialization
   - Remove Content-Type header — axios sets it automatically
   - Keep the toast.success on success
   - Keep the redirect on success
   - Keep error formatting in catch block

4. Ensure `useAuth` hook is still imported for any non-API uses

5. Keep all validation logic (react-hook-form + zod) unchanged
  </action>
  <verify>
    <automated>
      grep -q "import.*apiClient.*from.*api-client" app/\(app\)/pacientes/nuevo/page.tsx && echo "PASS: Import added" || echo "FAIL"
      grep -q "apiClient.post" app/\(app\)/pacientes/nuevo/page.tsx && echo "PASS: POST migrated" || echo "FAIL"
      grep -c "fetch(" app/\(app\)/pacientes/nuevo/page.tsx | xargs -I {} test {} -le 1 && echo "PASS: fetch calls removed" || echo "WARN: Some fetch calls remain"
    </automated>
  </verify>
  <done>New patient form uses apiClient.post() instead of fetch; 401/403 handling delegated to interceptors; success flow unchanged; error handling preserves user messages</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Migrate new appointment form to axios</name>
  <files>app/(app)/calendario/nueva-cita/page.tsx</files>
  <behavior>
    - Form submission uses apiClient.post() instead of fetch
    - Validation errors from server displayed to user
    - 401 response triggers logout and redirect
    - 403 response shows permission denied toast
    - Success shows toast and redirects to calendar
  </behavior>
  <action>
Read the current new appointment form to identify the submission handler, then migrate:

1. Add import at top of file:
   ```typescript
   import { apiClient } from '@/lib/api-client'
   ```

2. Find the form submission handler and migrate similar to Task 1:

   **Migrate from:**
   ```typescript
   const res = await fetch('/api/appointments', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${session?.access_token}`,
     },
     body: JSON.stringify(formData),
   })
   ```

   **To:**
   ```typescript
   await apiClient.post('/api/appointments', formData)
   ```

3. Remove the manual 401/403 handling blocks — interceptors will:
   - Handle 401: Clear session and redirect
   - Handle 403: Show toast with permission denied message

4. Keep the success toast and redirect:
   ```typescript
   toast.success('Appointment created successfully')
   router.push('/calendario')
   ```

5. Keep error handling with formatErrorMessage() for other errors

6. Ensure react-hook-form validation is unchanged
  </action>
  <verify>
    <automated>
      grep -q "import.*apiClient.*from.*api-client" app/\(app\)/calendario/nueva-cita/page.tsx && echo "PASS: Import added" || echo "FAIL"
      grep -q "apiClient.post" app/\(app\)/calendario/nueva-cita/page.tsx && echo "PASS: POST migrated" || echo "FAIL"
      grep -c "fetch(" app/\(app\)/calendario/nueva-cita/page.tsx | xargs -I {} test {} -le 1 && echo "PASS: fetch calls removed" || echo "WARN: Some fetch calls remain"
    </automated>
  </verify>
  <done>New appointment form uses apiClient.post() instead of fetch; 401/403 handling delegated to interceptors; success flow unchanged; error handling preserves user messages</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Migrate calendar page to axios</name>
  <files>app/(app)/calendario/page.tsx</files>
  <behavior>
    - Calendar fetches appointments using apiClient.get()
    - Loading states work identically to before
    - Error handling shows toast with formatted message
  </behavior>
  <action>
Read the current calendar page to identify fetch calls, then migrate:

1. Add import at top of file:
   ```typescript
   import { apiClient } from '@/lib/api-client'
   ```

2. Find the appointment fetching logic (likely in useEffect or a callback):

   **Example pattern:**
   ```typescript
   // BEFORE:
   const res = await fetch(`/api/appointments?fromDate=${from}&toDate=${to}`, {
     headers: { 'Authorization': `Bearer ${session?.access_token}` },
   })
   if (!res.ok) {
     const errData = await res.json().catch(() => ({}))
     throw new Error(errData.error || `HTTP ${res.status}`)
   }
   const json = await res.json()
   setAppointments(json.data || [])
   
   // AFTER:
   const { data } = await apiClient.get(`/api/appointments?fromDate=${from}&toDate=${to}`)
   setAppointments(data?.data || [])
   ```

3. Keep the date range filtering logic (fromDate/toDate query params)

4. Keep the calendar rendering logic unchanged

5. Keep error handling with formatErrorMessage()
  </action>
  <verify>
    <automated>
      grep -q "import.*apiClient.*from.*api-client" app/\(app\)/calendario/page.tsx && echo "PASS: Import added" || echo "FAIL"
      grep -q "apiClient.get" app/\(app\)/calendario/page.tsx && echo "PASS: GET migrated" || echo "FAIL"
      grep -c "fetch(" app/\(app\)/calendario/page.tsx | xargs -I {} test {} -le 1 && echo "PASS: fetch calls removed" || echo "WARN: Some fetch calls remain"
    </automated>
  </verify>
  <done>Calendar page uses apiClient.get() instead of fetch; date range filtering preserved; error handling preserves toast messages; calendar rendering unchanged</done>
</task>

</tasks>

<verification>
- [ ] New patient form imports apiClient and uses apiClient.post()
- [ ] New appointment form imports apiClient and uses apiClient.post()
- [ ] Calendar page imports apiClient and uses apiClient.get()
- [ ] All fetch calls for /api/* routes replaced with axios calls
- [ ] Success toasts and redirects work
- [ ] Error handling uses formatErrorMessage() consistently
- [ ] No regression in functionality
</verification>

<success_criteria>
- New patient form creates patient and redirects correctly
- New appointment form creates appointment and redirects correctly
- Calendar displays appointments with date filtering
- Error toasts appear on failures
- 401 responses redirect to login (handled by interceptor)
- No console errors on form submissions
</success_criteria>

<output>
After completion, create `.planning/phases/04-axios-integration/04-axios-integration-03-SUMMARY.md`
</output>
