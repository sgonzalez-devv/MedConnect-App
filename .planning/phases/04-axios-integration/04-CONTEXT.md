# Phase 4: Axios Integration - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning
**Source:** User request for AxiosIntegration phase

<domain>

## Phase Boundary

Replace native `fetch` API calls with Axios HTTP client throughout the application. This provides:
- Request/response interceptors for auth token handling
- Automatic retry logic for transient failures
- Consistent error handling across all API calls
- Better TypeScript support for HTTP responses

</domain>

<decisions>

## Implementation Decisions

### Axios as HTTP Client
- Use `axios` package for all HTTP requests (not native fetch)
- This is a **locked decision** — the user explicitly requested AxiosIntegration

### Migration Strategy
- Keep existing API structure (`/api/*` routes)
- Replace frontend fetch calls with axios calls
- Maintain all existing error handling patterns
- Preserve clinic_id filtering logic

### Error Handling with Axios
- Use axios response interceptors to catch 401/403 uniformly
- Convert axios errors to same ErrorResponse format used by error-handling.ts
- Maintain human-readable error messages for users

### Interceptors Required
- **Request interceptor:** Attach auth token from session/cookies
- **Response interceptor:** Handle 401 (redirect to login), 403 (show permission error), 5xx (retry logic)

### Retry Logic
- Automatic retry for GET requests on 5xx errors
- Maximum 3 retry attempts with exponential backoff
- No retry for POST/PUT/DELETE (idempotency concerns)

### the agent's Discretion
- Axios instance configuration (baseURL, timeout settings)
- Specific retry delay timing
- Migration order of which files to convert first

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Patterns
- `lib/api-service.ts` — Current API service layer using fetch (source to migrate from)
- `lib/error-handling.ts` — Error handling patterns to preserve
- `app/api/patients/route.ts` — Example API route pattern
- `app/(app)/pacientes/page.tsx` — Example frontend page with fetch

### Supabase Integration
- `@supabase/supabase-js` — Already installed; axios will work alongside Supabase client
- `lib/supabase.ts` — Supabase client; axios for custom API calls only

</canonical_refs>

<specifics>

## Specific Ideas

1. **Migration priority:** Start with dashboard and patient list pages, then appointment pages, then forms
2. **Test each migration:** Verify behavior matches before/after
3. **Keep fetch for Supabase:** The `@supabase/supabase-js` client uses its own fetch; only migrate custom `/api/*` calls

</specifics>

<deferred>

## Deferred Ideas

None — Axios integration is the focus of this phase

</deferred>

---

*Phase: 04-axios-integration*
*Context gathered: 2026-03-31 via user request*
