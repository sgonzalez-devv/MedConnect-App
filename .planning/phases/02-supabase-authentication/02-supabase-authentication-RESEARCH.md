# Research: Phase 1 - Supabase Authentication & Session Management

**Research Date:** 2026-03-27  
**Phase:** 1 - Supabase Authentication & Session Management  
**Researcher:** gsd-phase-researcher (orchestrator synthesis)  
**Status:** COMPLETE ✓

---

## Executive Summary

Supabase provides production-grade authentication with multiple options. For this project's Next.js/TypeScript stack, the **@supabase/ssr** package (with Next.js middleware) is the recommended modern approach. This replaces the deprecated `@supabase/auth-helpers-nextjs` and provides:

- Automatic session refresh via middleware
- Secure cookie-based token storage (HttpOnly, SameSite)
- Server-side session validation
- Custom user profiles with clinic assignments

**Key decision:** Use Supabase Auth + custom `users` table (not OAuth for v1).

---

## Validation Architecture

### Required Validations Before Phase 2 Can Begin

1. **Authentication Flow (E2E)**
   - Sign up → email verification → login → session persists
   - Test: `pnpm test:auth` runs full flow in <10s

2. **Session Persistence**
   - Verify token refresh happens before 1-hour TTL expires
   - Test: Leave browser open 1 hour, perform action, verify no 401

3. **Clinic Context in JWT**
   - JWT contains `clinic_id` and `user_role` claims
   - Test: Decode token from localStorage, verify claims present

4. **Logout Invalidation**
   - All tokens revoked after logout
   - Test: Logout, attempt API call with old token, verify 401

5. **Password Reset Flow**
   - Email sent, link opens, password resets, can login with new password
   - Test: Manual flow or email mocking

---

## Architectural Decisions

### 1. Authentication Package: @supabase/ssr

**Why not @supabase/auth-helpers-nextjs?**
- Deprecated; no longer maintained
- Built for older Next.js patterns (Pages Router)
- Not compatible with App Router server-side patterns

**@supabase/ssr benefits:**
- Officially recommended for Next.js 13+
- Works with App Router
- Handles cookie refresh automatically via middleware
- Smaller bundle impact than alternatives
- First-party, long-term support

**Integration pattern:**
```
middleware.ts (executes on every request)
  ↓ (validates + refreshes session)
  ↓
app/layout.tsx (wraps with SessionProvider)
  ↓
app/(app)/* (protected routes)
  ↓
useUser() hook (inside client components)
```

### 2. Session Storage: HttpOnly Cookies (NOT localStorage)

**Why HttpOnly cookies?**
- XSS-safe (JavaScript cannot access)
- Automatically sent with every request
- Refresh token can be secure (HttpOnly) + access token (separate strategy)

**Token strategy:**
- **Access token:** Short-lived (15 min), sent in Authorization header
- **Refresh token:** HttpOnly cookie, long-lived (7 days), auto-rotated

### 3. Custom Users Table + Clinic Assignment

**Schema (simplified):**
```sql
users (Supabase Auth managed)
├── id (UUID, auth_uid)
├── email
├── password (encrypted)

custom_users (app-managed)
├── id (FK to users.id)
├── clinic_id (FK to clinics.id) — NOT nullable
├── role ('admin', 'doctor', 'staff')
├── full_name
├── created_at

clinics
├── id (UUID)
├── name
```

**Why separate table?**
- Supabase Auth (`users`) only for auth; cannot modify fields
- `custom_users` table allows clinic assignments and role tracking
- JWT claims populated from `custom_users` at login

### 4. JWT Custom Claims Population

**Flow:**
```
User logs in
  ↓
Supabase Auth verifies credentials
  ↓
PostgreSQL trigger ON auth.users INSERT/UPDATE
  ↓
Fetch custom_users row for this user
  ↓
Call Supabase RLS "get_user_claims" function
  ↓
Inject clinic_id + role into JWT
  ↓
Return JWT to client
```

**Why RLS function?**
- Supabase's `auth.jwt()` contains custom claims
- Function ensures claims match RLS policies (no privilege escalation)
- One source of truth for roles

### 5. Email Verification (Mandatory for Production)

**Supabase Auth default behavior:**
- Email verification OFF by default (for dev)
- Flips to ON in production
- Auto-sends verification email after signup

**For this phase:**
- Set `SUPABASE_AUTH_CONFIRM_EMAIL=true` in `.env.local`
- Email provider: Supabase (built-in, no config needed for dev)
- Production: Configure custom SMTP or use Supabase email relay

### 6. Session Expiration & Refresh Strategy

**Recommended settings:**
- JWT expiry: 1 hour (short-lived)
- Refresh token expiry: 7 days (matches requirement: "session expires after 7 days")
- Refresh behavior: Auto-refresh before expiry (middleware handles)

**Test requirement:**
- User stays logged in for 7 days → session expires cleanly
- Next action after 7 days → redirect to login (no silent failure)

### 7. Password Reset Flow

**Supabase native:**
- User requests password reset
- Email sent with time-limited link
- Link opens to reset form on your site
- Password updated via Supabase API
- User can login with new password

**Implementation:**
- Catch `/auth/callback?type=recovery` in middleware
- Render password reset form
- Call `supabase.auth.updateUser()` after reset

---

## Integration Patterns for MedConnect

### Middleware Setup

**File: `middleware.ts`** (root of project)

Responsibility:
- Intercept all requests
- Validate session cookie
- Refresh token if needed
- Set `X-User-ID` header for protected routes

### Layout Provider

**File: `app/layout.tsx`**

Responsibility:
- Wrap app with `SessionProvider`
- Initialize Supabase client
- Provide session context to children

### Protected Routes

**File: `app/(app)/layout.tsx`**

Responsibility:
- Check `useUser()` hook
- Redirect unauthenticated users to `/login`
- Display clinic context (clinic selector if v1 allows multi-clinic)

### API Layer (Phase 3)

**Pattern:** All API functions receive `clinic_id` from JWT claims

---

## Common Pitfalls & Mitigations

| Pitfall | Cause | Mitigation | When |
|---------|-------|-----------|------|
| Cookie size exceeds 4KB | Large JWT claims or tokens | Monitor token size; use minimal claims (clinic_id, role) | Phase 1 testing |
| Token refresh timing misses 1-hour mark | Middleware not triggered | Set JWT TTL to 30 min; test 2-hour session | Phase 1 testing |
| Deprecated auth helpers used | Copy/paste from old docs | Use @supabase/ssr 0.9.0+; verify package.json | Phase 1 implementation |
| RLS policies block JWT claims | Claims not in correct format | Test JWT decode; verify function call works | Phase 2 integration |
| Clinic context lost after refresh | Custom claims not persisted | Regenerate claims on every token refresh | Phase 1 testing |

---

## External Dependencies

**Required packages:**
- `@supabase/supabase-js` (2.100.1+) — Main SDK
- `@supabase/ssr` (0.9.0+) — Next.js integration
- `js-cookie` (optional, for client-side token access) — Already in stack? Check package.json

**Environment variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Supabase setup (one-time, not in code):**
- Create Supabase project
- Create `custom_users` and `clinics` tables
- Create JWT claim injection trigger
- Configure email domain (production)

---

## Code Review Checklist

Before Phase 1 implementation, verify:

- [ ] `package.json` uses `@supabase/ssr`, not `@supabase/auth-helpers-nextjs`
- [ ] `middleware.ts` exists at project root and validates session
- [ ] `app/layout.tsx` wraps app with SessionProvider
- [ ] `useUser()` hook returns user + clinic context
- [ ] Sign-up form calls `supabase.auth.signUp()`
- [ ] Login form calls `supabase.auth.signInWithPassword()`
- [ ] Logout form calls `supabase.auth.signOut()`
- [ ] Protected routes check user before rendering
- [ ] JWT decode test verifies clinic_id + role claims

---

## Success Metrics

**Phase 1 complete when:**
1. ✅ User can sign up with email + password
2. ✅ Email verification sent and must be confirmed
3. ✅ User can log in after verification
4. ✅ Session persists across browser refresh
5. ✅ JWT contains clinic_id and user_role
6. ✅ User can log out (session invalidated)
7. ✅ Password reset flow works end-to-end
8. ✅ Session auto-refreshes before 1-hour TTL
9. ✅ Session expires after 7 days (manual test)
10. ✅ User profile page displays clinic + role

---

## Technical Stack (Locked for Phase 1)

- **Frontend:** Next.js 16 (App Router) + TypeScript + React 19
- **Backend:** Supabase (Auth + PostgreSQL)
- **Package:** @supabase/ssr 0.9.0+
- **Validation:** React Hook Form + Zod (existing)

---

## Next Phase Dependencies

**Phase 2 (Database Schema & RLS) requires:**
- ✅ Working Supabase Auth (this phase)
- ✅ JWT claims injection (clinic_id, role)
- ✅ Custom `users` table with clinic assignments
- ✅ Middleware validating session

**Phase 3 (API Integration) requires:**
- ✅ All Phase 2 + RLS policies tested

---

## RESEARCH COMPLETE ✓

Ready for planning.

---

*Research completed: 2026-03-27*  
*Next: Planning Phase 1 implementation via gsd-planner*
