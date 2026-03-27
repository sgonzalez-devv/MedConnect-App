# Stack Research: Supabase Integration for Next.js 16

**Domain:** Full-stack medical app with Supabase backend  
**Context:** Adding Supabase to existing Next.js 16 + TypeScript + Tailwind + shadcn/ui  
**Researched:** 2026-03-27  
**Confidence:** HIGH

---

## Recommended Stack

### Core Backend Integration

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@supabase/supabase-js` | 2.100.1 | Supabase JavaScript client | Official, type-safe, handles all Supabase services (Auth, DB, Storage, Realtime) |
| `@supabase/ssr` | 0.9.0 | Server-Side Rendering support for Supabase | Replaces auth-helpers, provides cookie-based auth for Next.js App Router, server components & server actions |
| TypeScript | 5.7.3 | Type safety (already installed) | Maintain type safety across Supabase integration, use generated types from Supabase CLI |

### Authentication & Session Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/ssr` (built-in) | 0.9.0 | Cookie-based auth, session persistence | **Always** — handles client & server auth automatically |
| `js-cookie` (optional) | Latest | Cookie manipulation utilities | Only if you need direct cookie control beyond @supabase/ssr |

### Form Validation (Already Present)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `react-hook-form` | ^7.54.1 | Form state management (already installed) | Integrates cleanly with Zod validation, lightweight, pairs well with auth forms |
| `zod` | ^3.24.1 | Schema validation (already installed) | Type-safe validation, works with auth payloads, generates types from schemas |

### Type Generation & Database Schema

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `supabase` CLI | Latest (global) | Schema management, migration, type generation | Dev-only, run during development to generate types from Supabase schema |

---

## Installation Guide

### Step 1: Install Core Supabase Packages

```bash
# Add Supabase client and SSR support
pnpm add @supabase/supabase-js @supabase/ssr
```

### Step 2: Environment Variables

Create `.env.local` in project root:

```env
# NEW key format (recommended, more secure)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxx

# OR LEGACY format (still works, plan to migrate)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Key Selection Rationale:**
- Use new `sb_publishable_*` keys (preferred by Supabase)
- Legacy `anon` keys still work during transition period
- Never expose `service_role` or `sb_secret_*` keys to client

### Step 3: Set Up Client Files (Dev Only)

```bash
# Install Supabase CLI globally for type generation
npm install -g supabase
```

**Skip Installation of Auth Helpers:**
- ❌ Do NOT install `@supabase/auth-helpers-nextjs` — deprecated, replaced by @supabase/ssr
- ✅ Use `@supabase/ssr` instead

---

## Package Breakdown by Use Case

### For Authentication

**Minimum setup:**
- `@supabase/supabase-js` — create client, call auth methods
- `@supabase/ssr` — persist session in cookies, handle server auth
- `react-hook-form` + `zod` — validate login/signup forms (already have these)

**Example auth flow:**
1. User submits form (react-hook-form validates with zod)
2. Call `supabase.auth.signUpWithPassword()` 
3. @supabase/ssr stores session in secure HTTP-only cookies
4. Subsequent requests include session automatically

### For Database Queries

**Minimum setup:**
- `@supabase/supabase-js` — `.from("table").select()`
- `@supabase/ssr` — creates client with auth context in server components

**No additional ORM needed** for v1 (Prisma, TypeORM, etc. are optional for later phases)

### For Real-time Subscriptions (Optional for v1)

**Already included in `@supabase/supabase-js`:**
```typescript
supabase
  .from('appointments')
  .on('*', (payload) => console.log('Update:', payload))
  .subscribe()
```

No additional packages needed.

### For File Storage (Optional for v1)

**Already included in `@supabase/supabase-js`:**
```typescript
supabase.storage.from('bucket').upload('file')
```

No additional packages needed for basic uploads.

---

## What NOT to Install

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@supabase/auth-helpers-nextjs` | **Deprecated** as of Feb 2024, replaced by @supabase/ssr | `@supabase/ssr` |
| `@supabase/auth-helpers-react` | Deprecated, superseded by @supabase/ssr | `@supabase/ssr` |
| `next-auth` | Overkill for Supabase auth, adds complexity | Use Supabase Auth directly |
| `prisma` or other ORMs | Optional, not needed for v1, adds build complexity | Raw SQL via `supabase-js` client queries |
| `apollo-client` or other GraphQL clients | Supabase has REST API, GraphQL is optional | Use REST (built into supabase-js) |

---

## Versions: Current as of 2026-03-27

All versions verified against npm registry:

| Package | Latest | Status | Notes |
|---------|--------|--------|-------|
| `@supabase/supabase-js` | 2.100.1 | ✅ Current | Breaking changes are rare, major version stable |
| `@supabase/ssr` | 0.9.0 | ✅ Current | Stable for Next.js App Router |
| Next.js | 16.1.6 | ✅ Installed | App Router supported |
| TypeScript | 5.7.3 | ✅ Installed | Type safety ready |
| React | 19.2.4 | ✅ Installed | Works with Supabase |

**Update cadence:** Check for Supabase updates quarterly; they rarely break existing code.

---

## Implementation Architecture

### Client Creation Pattern

MedConnect needs **two Supabase clients**:

#### 1. Browser Client (Client Components)
```typescript
// lib/supabase/browser.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
```

Used in: LoginForm, PatientSearch, AppointmentCalendar (client components)

#### 2. Server Client (Server Components & Actions)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            cookieStore.set(name, value)
          })
        }
      }
    }
  )
}
```

Used in: Server actions for mutations, server components for queries

**Why two clients?**
- Browser client: Can't set HTTP-only cookies
- Server client: Can access cookies, refresh tokens automatically
- Both share session via cookies transparently

---

## Compatibility Notes

### Next.js 16 + Supabase

| Feature | Status | Notes |
|---------|--------|-------|
| App Router | ✅ Full support | `@supabase/ssr` is built for App Router |
| Server Components | ✅ Full support | Use server client for data fetching |
| Server Actions | ✅ Full support | Use server client for mutations |
| Client Components | ✅ Full support | Use browser client for real-time |
| Middleware | ⚠️ Partial support | Token refresh requires proxy route |
| Incremental Static Revalidation (ISR) | ⚠️ Cache concerns | See advanced guide for caching strategy |

### TypeScript Integration

MedConnect's existing TypeScript setup (5.7.3) fully supports:
- ✅ Supabase type generation (`supabase gen types`)
- ✅ react-hook-form with zod schemas
- ✅ Type-safe queries from auto-generated database types

**Type generation example:**
```bash
supabase gen types typescript --local > lib/supabase/types.ts
```

Generates types like `Database['public']['Tables']['users']['Row']` from your schema.

---

## Alternatives Considered

| Our Choice | Alternative | When Alternative is Better |
|------------|-------------|---------------------------|
| Supabase Auth + custom users table | OAuth (Google, GitHub) | If OAuth is required for v2 (currently out of scope) |
| Supabase REST (included in supabase-js) | Supabase GraphQL | Never for v1; GraphQL adds complexity with no benefit |
| `@supabase/ssr` for server auth | Manual cookie handling | Never; @supabase/ssr handles edge cases automatically |
| Raw SQL queries via supabase-js | Prisma ORM | Prisma option for v2 if schema becomes very complex |

---

## Stack Patterns for MedConnect

### Pattern 1: Multi-Clinic Data Isolation

Use Supabase RLS (Row Level Security) policies combined with clinic_id filtering:

```sql
-- RLS policy: Users see only their clinic's data
CREATE POLICY clinic_isolation 
  ON patients 
  USING (clinic_id = auth.jwt() -> 'clinic_id'::text)
```

No additional npm packages needed; use Supabase policy system.

### Pattern 2: User Authentication + Role-Based Access

Supabase Auth handles session, custom `users` table extends with roles:

```typescript
// lib/supabase/auth.ts
interface UserProfile {
  id: string
  email: string
  clinic_id: string
  role: 'admin' | 'doctor' | 'staff'
  clinic_name: string
}
```

Fetch from custom table after auth succeeds; role checked client & server-side.

### Pattern 3: Offline-First Data Layer (Future)

For v2+: Add `@journeyapps/powersync` with Supabase for offline sync. Not needed for v1.

---

## Development Workflow

### Initial Setup (One Time)

```bash
# 1. Create Supabase account and project
# 2. Copy connection details to .env.local
# 3. Install packages
pnpm add @supabase/supabase-js @supabase/ssr

# 4. Set up client files (lib/supabase/server.ts, lib/supabase/browser.ts)
# 5. Create auth middleware (app/_middleware.ts) for token refresh
```

### Ongoing Development

```bash
# After schema changes in Supabase dashboard:
supabase gen types typescript --local > lib/supabase/types.ts

# This regenerates types from your live schema
# Commit updated types.ts to repo
```

### Before Deployment

- Verify `.env.local` is in `.gitignore`
- Copy NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to hosting env vars
- Never commit real keys; use hosting platform secrets

---

## Known Gotchas & Mitigations

### 1. Cookie Size Limits
**Issue:** JWT tokens can exceed cookie size limits in some browsers  
**Mitigation:** Use new `sb_publishable_*` keys (smaller than JWT-based `anon` keys)

### 2. CORS When Calling from Browser
**Issue:** Browser can't call Supabase API directly without proper CORS  
**Mitigation:** Supabase handles CORS; use publishable key in browser client

### 3. Row-Level Security (RLS) Silent Failures
**Issue:** Queries return empty results if RLS policy denies access (no error)  
**Mitigation:** Test RLS policies in Supabase dashboard before deploying

### 4. Realtime Token Refresh
**Issue:** Long-lived sessions need token refresh in server components  
**Mitigation:** @supabase/ssr handles automatically via middleware

---

## Sources

- **Official Supabase Docs** (verified 2026-03-27)
  - https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
  - https://supabase.com/docs/guides/auth/server-side/creating-a-client
  - https://supabase.com/docs/guides/api/api-keys

- **npm Registry** (verified 2026-03-27)
  - @supabase/supabase-js@2.100.1 latest
  - @supabase/ssr@0.9.0 latest
  - All versions checked against npm registry

- **MedConnect Project Context** (.planning/PROJECT.md)
  - Next.js 16 (App Router) confirmed
  - TypeScript 5.7.3 confirmed
  - No OAuth requirement for v1

---

**Stack Research Complete**  
**Ready for:** Implementation phase, environment setup, client creation  
**Next Steps:** Create lib/supabase/server.ts and lib/supabase/browser.ts utilities
