# Domain Pitfalls: Supabase Backend Integration

**Domain:** Full-stack medical app with Supabase backend  
**Researched:** 2026-03-27  
**Confidence:** HIGH

---

## Critical Pitfalls (Will cause rewrites or major issues)

### Pitfall 1: Row-Level Security (RLS) Misconfiguration

**What goes wrong:**  
Developers write RLS policies that silently deny access. Queries return empty arrays without error. Users see blank screens. Debugging is nearly impossible because no error is thrown.

**Why it happens:**
- RLS policy syntax is unfamiliar (PostgreSQL-specific)
- Testing is optional-feeling; developers skip it
- Policies are tested in Supabase UI but never tested from app code
- Role assignments (clinic_id, is_doctor, etc.) don't match policy assumptions

**Consequences:**
- Users see no data → support tickets → emergency debugging
- If RLS is too loose, data breach → HIPAA violation
- If RLS is too tight, feature broken → rollback required
- Can take days to diagnose because no error is logged

**Prevention:**
1. **Test EVERY policy before committing:** Use Supabase UI's "Impersonate" feature to test as different roles
2. **Write policy tests:** For each role, query and verify results
3. **Add logging to queries:**
   ```typescript
   const { data, error } = await supabase.from('patients').select()
   if (data?.length === 0 && !error) {
     console.warn('⚠️ Empty result—check RLS policy', {
       role: session.user.role,
       clinic_id: session.user.clinic_id
     })
   }
   ```
4. **RLS audit checklist:**
   - [ ] Policy tests written (per role, per clinic)
   - [ ] Policies tested in UI before deploy
   - [ ] Query logging in place
   - [ ] Error monitoring setup (Sentry)

**Detection:**
- Monitor for "empty data" complaints
- Check Supabase logs for RLS denials
- Query Supabase analytics for zero-row queries

---

### Pitfall 2: Clinic Isolation Bypass (Multi-Tenant Data Leak)

**What goes wrong:**  
Developer forgets clinic_id filter in one query. Patient from Clinic A sees Clinic B's data. HIPAA/regulatory violation. Legal liability.

**Why it happens:**
- RLS provides false sense of security; developer thinks "RLS handles it"
- RLS is server-side security; app-level filtering is a separate concern
- Not all queries go through RLS (e.g., admin API endpoints may bypass RLS)
- Copy-paste queries, forget to add WHERE clinic_id clause

**Consequences:**
- **HIPAA violation** — Protected Health Information (PHI) exposure
- **Legal liability** — Fines up to $1.5M per violation
- **Patient lawsuits** — Breach notification required
- **Reputational damage** — Clinics lose trust

**Prevention:**
1. **Double-layer filtering (defense in depth):**
   - Layer 1: App-level WHERE clause in every query
   - Layer 2: RLS policy as backup
   ```typescript
   // ALWAYS filter by clinic_id at app level
   const { data } = await supabase
     .from('patients')
     .select()
     .eq('clinic_id', currentClinic) // Layer 1: App-level
     // Layer 2: RLS policy also checks clinic_id
   ```

2. **Code review checklist:**
   - [ ] Every SELECT includes `.eq('clinic_id', ...)`
   - [ ] Every INSERT sets clinic_id automatically
   - [ ] Every UPDATE checks clinic_id matches
   - [ ] Every DELETE checks clinic_id matches

3. **Type safety for clinic context:**
   ```typescript
   type ClinicContext = { clinic_id: string } // Must have clinic_id
   function fetchPatients(clinic: ClinicContext) {
     // Enforce clinic_id in function signature
     return supabase.from('patients').select().eq('clinic_id', clinic.clinic_id)
   }
   ```

**Detection:**
- Code review: Grep for `.from(` queries, verify clinic_id filter
- Integration test: Login as Clinic A, confirm Clinic B data is blocked
- Monitor access logs for unusual clinic switching

---

### Pitfall 3: Deprecated Auth Helpers (Wrong Package)

**What goes wrong:**  
Developer installs old `@supabase/auth-helpers-nextjs` package instead of new `@supabase/ssr`. Code doesn't compile. Middleware doesn't work with App Router. Requires refactoring.

**Why it happens:**
- Stack Overflow answers reference old package (no deprecation warning in search results)
- GitHub tutorials from 2023-2024 use old package
- NPM doesn't automatically warn about deprecation during install
- Easy to copy-paste wrong package name

**Consequences:**
- App doesn't compile
- Middleware setup doesn't work with Next.js App Router
- Full refactoring required mid-project
- Wasted time debugging incompatible code

**Prevention:**
1. **Use official docs as source of truth:**
   - Always check https://supabase.com/docs/guides/auth/server-side/creating-a-client
   - Official docs recommend `@supabase/ssr` (2024+)
   - Copy code directly from official docs, not StackOverflow

2. **Check package.json immediately after adding Supabase:**
   ```bash
   npm list | grep @supabase
   ```
   Should show ONLY:
   - `@supabase/supabase-js`
   - `@supabase/ssr`

**Detection:**
```bash
npm ls @supabase/auth-helpers-* 2>/dev/null | grep -q '@supabase/auth-helpers' && echo "OLD PACKAGE FOUND"
```

---

### Pitfall 4: Token Refresh Timing (Silent 401 Errors)

**What goes wrong:**  
User makes a request at 1:00 PM. Auth token expires at 1:01 PM. User makes another request at 1:02 PM. Request fails with 401 Unauthorized. No automatic refresh happens.

**Why it happens:**
- Supabase auth tokens expire after 1 hour
- Token refresh requires a server-side operation (can't refresh in browser)
- @supabase/ssr provides auto-refresh, but only if middleware is set up correctly
- Developers skip middleware setup thinking it's optional

**Consequences:**
- Users get logged out unexpectedly
- Long-running operations fail
- Support tickets: "App stopped working"
- Difficult to reproduce (timing-dependent)

**Prevention:**
1. **Set up middleware proxy for token refresh:**
   ```typescript
   // middleware.ts
   export async function middleware(request: NextRequest) {
     const supabase = createServerClient(..., {
       cookies: { ... }
     })
     
     // This line triggers token refresh
     const { data } = await supabase.auth.getSession()
     
     // Token is now fresh; pass it forward
     return response
   }
   ```

2. **Verify token refresh in logs:**
   - Monitor Supabase auth logs for refresh events
   - Check for 401 errors (should be rare if middleware works)

**Detection:**
- Monitor for 401 errors in production logs
- Check if 401s increase near 1-hour marks (token expiry)
- User reports: "App stopped working, logout/login fixed it"

---

### Pitfall 5: Cookie Size Limit (Oversized JWT Tokens)

**What goes wrong:**  
Session cookie grows beyond 4KB (browser limit). Auth fails silently. Users are logged out without explanation.

**Why it happens:**
- Old JWT-based `anon` keys produce large tokens
- Tokens contain all user claims (role, permissions, clinic_id)
- Custom claims added to token make it bigger
- New `sb_publishable_*` keys are smaller but some projects still use old keys

**Consequences:**
- Auth fails silently (most confusing for users)
- "Works locally but not in production" (different env vars)
- Impossible to debug without checking dev tools
- Users get logged out randomly

**Prevention:**
1. **Use new sb_publishable_* keys (smaller):**
   ```env
   # NEW (2024+, recommended)
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   ```

2. **Verify cookie size:**
   ```typescript
   // In browser console
   document.cookie
     .split('; ')
     .find(c => c.startsWith('sb-'))
     ?.split('=')[1]
     .length // Should be < 4000 bytes
   ```

**Detection:**
- User reports: "App randomly logs me out"
- Check browser DevTools → Application → Cookies
- Look for `sb-<project>-auth-token` size

---

## Moderate Pitfalls (Will cause bugs or delays)

### Pitfall: RLS Policy Permissions for Admin Users

**What goes wrong:**  
Admin users need to see all clinics' data. RLS policy denies admin access because clinic_id doesn't match.

**Prevention:**
```sql
-- Policy: Users see their clinic, admins see all
CREATE POLICY clinic_view ON patients
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    OR auth.jwt() ->> 'role' = 'admin'
  )
```

---

### Pitfall: Pagination Performance (Large Result Sets)

**What goes wrong:**  
Query for "all appointments" returns 50,000 rows. App hangs. Network times out.

**Prevention:**
```typescript
// Use limit + offset for pagination
const { data } = await supabase
  .from('appointments')
  .select()
  .eq('clinic_id', clinic)
  .order('date', { ascending: false })
  .range(0, 49) // First 50 rows
```

---

### Pitfall: Error Handling (No Fallback UI)

**What goes wrong:**  
Supabase is down. Query fails. App shows white screen (no error boundary).

**Prevention:**
```typescript
const [error, setError] = useState<string | null>(null)

try {
  const { data, error: dbError } = await supabase.from('patients').select()
  if (dbError) throw dbError
} catch (e) {
  setError('Failed to load data.')
  return <ErrorBoundary message={error} />
}
```

---

## Phase-Specific Pitfall Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|-----------|
| **1: Auth** | Token refresh not tested | Add 1-hour TTL test before phase 2 |
| **2: Schema** | RLS policies not tested | Require policy tests for each role before phase 3 |
| **2: Schema** | Cookie size exceeds limit | Verify with dev tools; use sb_publishable_* keys |
| **3: API** | Clinic isolation filters forgotten | Code review: clinic_id in every query |
| **3: API** | Pagination missing | Add limit+offset to queries returning > 100 rows |
| **4: Testing** | RLS test coverage incomplete | Test as each role + clinic combination |

---

## Sources

- **Supabase Documentation** (verified 2026-03-27)
  - RLS guide: https://supabase.com/docs/guides/database/postgres/row-level-security
  - Auth setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client

- **HIPAA Compliance**
  - Breach penalties: OCR enforcement
  - Multi-tenant isolation: HIPAA Security Rule

- **Next.js Best Practices**
  - Middleware: https://nextjs.org/docs/app/api-reference/functions/middleware
  - Error handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling

---

**Pitfalls Research Complete**  
**Most Critical:** RLS misconfiguration + clinic isolation bypass = data breach risk
