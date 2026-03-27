# Architecture: Supabase Integration for MedConnect

**Domain:** Full-stack medical records system with multi-clinic support  
**Researched:** 2026-03-27  
**Confidence:** HIGH

---

## Recommended Architecture

MedConnect uses a **layered architecture** with clear separation between client, server, and backend:

```
Client Layer (React)
    ↓
Server Layer (Next.js App Router, Server Actions)
    ↓
API Service Layer (lib/api/ — business logic)
    ↓
Data Layer (Supabase client)
    ↓
Supabase Backend (PostgreSQL + Auth)
```

**Key principle:** Each layer has a single responsibility. Client components don't query Supabase directly; they call server actions. Server actions delegate to service layer. Service layer wraps Supabase client calls.

---

## Component Boundaries

### 1. Client Components (UI Layer)

**Responsibility:** User interaction, form input, state management  
**Cannot do:** Make database queries directly, access secrets

**Examples:**
- LoginForm — captures credentials, submits to server action
- PatientSearch — search input, debouncing, UI state
- AppointmentCalendar — interactive calendar, date selection

**Pattern:**
```typescript
'use client' // Client component marker

import { signIn } from '@/app/auth/actions'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return <LoginForm onSubmit={signIn} /> // Pass server action as callback
}
```

---

### 2. Server Components (Data Fetching Layer)

**Responsibility:** Fetch data at render time, pass to client components  
**Can do:** Query Supabase, access secrets, perform auth checks  
**Cannot do:** Use hooks, interactive features

**Examples:**
- PatientList — fetches patients from DB, renders list
- AppointmentDetail — fetches appointment by ID, shows details
- ClinicDashboard — aggregates clinic statistics

**Pattern:**
```typescript
import { fetchPatients } from '@/lib/api/patients'

export default async function PatientsPage() {
  const patients = await fetchPatients(clinic)
  
  return (
    <div>
      {patients.map(p => (
        <PatientCard key={p.id} patient={p} />
      ))}
    </div>
  )
}
```

---

### 3. Server Actions (Mutation Layer)

**Responsibility:** Handle form submissions, mutations, data changes  
**Can do:** Query Supabase, validate input, modify database  
**Runs on:** Server, not browser

**Examples:**
- signIn, signUp, signOut — authentication
- createAppointment — book appointment
- updatePatient — modify patient record

**Pattern:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  
  redirect('/dashboard')
}
```

---

### 4. API Service Layer (Business Logic)

**Responsibility:** Reusable functions for data access, validation, business rules  
**Location:** lib/api/  
**Modules:** patients.ts, appointments.ts, consultations.ts, etc.

**What service functions do:**
1. Create server client
2. Apply clinic-aware filtering (clinic_id)
3. Execute query
4. Handle errors with logging
5. Return typed response

**Example:**
```typescript
// lib/api/patients.ts
import type { Database } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'

type Patient = Database['public']['Tables']['patients']['Row']

export async function fetchPatients(clinicId: string): Promise<Patient[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select()
    .eq('clinic_id', clinicId) // Clinic isolation
    .order('name')
  
  if (error) {
    console.error('Failed to fetch patients:', error)
    throw new Error('Failed to load patients')
  }
  
  return data
}
```

**Why separate from server actions?**
- Reusable across multiple server actions
- Easier to test
- Single source of truth for data access
- Clinic filtering in one place

---

### 5. Supabase Client Layer

**Responsibility:** Communicate with Supabase backend  
**Two clients needed:**

#### Server Client (lib/supabase/server.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
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

Used in: Server components, server actions, route handlers  
Features: Session persistence, automatic token refresh

#### Browser Client (lib/supabase/browser.ts)
```typescript
'use client'

import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
```

Used in: Client components (realtime subscriptions)  
Features: Lightweight, session shared via cookies

---

### 6. Middleware (Session Management)

**Responsibility:** Token refresh proxy  
**Location:** middleware.ts (app root)

**What it does:**
1. Intercept every request
2. Refresh auth token if expired
3. Set fresh token in cookies
4. Pass request forward

**Why needed:** Server components can't write cookies directly; middleware acts as proxy.

**Pattern:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  
  // Refresh token
  await supabase.auth.getSession()
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Data Flow Examples

### Example 1: User Views Clinic Dashboard

```
1. User navigates to /dashboard
2. Root layout loads ClinicProvider (sets clinic context)
3. DashboardPage (server component) renders
4. DashboardPage calls fetchDashboardStats(clinicId)
5. Service function creates server client
6. Server client runs query with clinic_id filter
7. RLS policy checks: clinic_id matches user's JWT clinic_id ✓
8. Database returns stats
9. Server component passes stats to client component <DashboardStats />
10. UI renders dashboard
```

**Security layers:**
- Layer 1: App-level clinic_id filter
- Layer 2: RLS policy in database
- Layer 3: User JWT checked at query time

---

### Example 2: User Books an Appointment

```
1. User fills appointment form (client component)
2. Form validation: react-hook-form + Zod
3. User clicks "Book Appointment"
4. Form calls server action (bookAppointment)
5. Server action receives form data
6. Server action calls lib/api/appointments.ts
7. Service function validates clinic_id matches current clinic
8. Service function calls Supabase insert
9. RLS policy checks: clinic_id matches ✓
10. Database inserts appointment
11. Supabase returns new appointment ID
12. Service function returns typed response
13. Server action redirects to confirmation page
14. Other users receive realtime update via subscription
```

**Mutations always flow:** Client Form → Server Action → Service Layer → Supabase

---

## Core Patterns

### Pattern 1: Clinic-Aware Queries (Defense in Depth)

Filter at app level AND RLS level. If one fails, other protects.

```typescript
// lib/api/patients.ts
export async function fetchPatients(clinicId: string) {
  const supabase = await createClient()
  
  // Layer 1: App-level filter
  const { data } = await supabase
    .from('patients')
    .select()
    .eq('clinic_id', clinicId)  // Explicit filter
    // Layer 2: RLS policy also checks clinic_id
  
  return data
}
```

---

### Pattern 2: Type-Safe Queries

```typescript
// Auto-generate types from Supabase schema
// Command: supabase gen types typescript --local > lib/supabase/types.ts

import type { Database } from '@/lib/supabase/types'

type Patient = Database['public']['Tables']['patients']['Row']

export async function fetchPatients(clinicId: string): Promise<Patient[]> {
  // Return type is typed; IDE autocomplete works
  const { data } = await supabase.from('patients').select()
  return data
}
```

---

### Pattern 3: Error Handling with Context

```typescript
export async function fetchPatients(clinicId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('patients')
      .select()
      .eq('clinic_id', clinicId)
    
    if (error) throw error
    return data
  } catch (error) {
    // Log with context for debugging
    console.error('Failed to fetch patients', {
      clinic_id: clinicId,
      error: error.message,
      timestamp: new Date().toISOString(),
    })
    
    // Throw user-friendly error
    throw new Error('Failed to load patients. Please try again.')
  }
}
```

---

### Pattern 4: Realtime Updates

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'

export function AppointmentList({ clinicId }: { clinicId: string }) {
  const [appointments, setAppointments] = useState([])
  
  useEffect(() => {
    // Subscribe to appointment changes
    const subscription = supabase
      .from('appointments')
      .on('*', (payload) => {
        console.log('Update:', payload.new)
        // Merge update into state
        setAppointments(prev => 
          prev.map(a => a.id === payload.new.id ? payload.new : a)
        )
      })
      .subscribe()
    
    // Cleanup: unsubscribe when component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return <div>{/* render appointments */}</div>
}
```

**Key:** Only client components can subscribe to realtime. Server components use browser client for subscriptions, server client for queries.

---

## Anti-Patterns to Avoid

### ❌ Direct Database Queries in Client Components

```typescript
// BAD: Exposing Supabase to client
'use client'

const { data } = await supabase.from('patients').select() // No clinic filter!
```

✅ **Better:** Use server component + service layer

---

### ❌ Skipping Clinic Filtering

```typescript
// BAD: Anyone can see all clinics' data
const { data } = await supabase.from('patients').select()
```

✅ **Better:** Always filter by clinic

```typescript
const { data } = await supabase
  .from('patients')
  .select()
  .eq('clinic_id', clinicId)
```

---

### ❌ Storing Secrets in Client Code

```typescript
// BAD: Service key exposed to browser
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
```

✅ **Better:** Use publishable key in client, service key server-side only

---

### ❌ Manual Token Management

```typescript
// BAD: Reinventing auth
if (tokenExpired()) {
  token = await refreshToken()
}
```

✅ **Better:** Let @supabase/ssr handle it via middleware

---

## File Structure

```
app/
├── auth/
│   ├── login/page.tsx          (LoginPage server component)
│   ├── signup/page.tsx         (SignupPage server component)
│   └── actions.ts              (Server actions: signIn, signUp, signOut)
│
├── (dashboard)/
│   ├── patients/
│   │   ├── page.tsx            (PatientList server component)
│   │   └── [id]/page.tsx       (PatientDetail server component)
│   │
│   ├── appointments/
│   │   ├── page.tsx            (AppointmentList server component)
│   │   └── [id]/page.tsx       (AppointmentDetail server component)
│   │
│   └── layout.tsx              (Dashboard layout, clinic context)
│
├── middleware.ts               (Session management)
└── layout.tsx                  (Root layout)

lib/
├── supabase/
│   ├── server.ts               (Server client factory)
│   ├── browser.ts              (Browser client factory)
│   ├── types.ts                (Auto-generated from schema)
│   └── middleware.ts           (Utilities for middleware)
│
├── api/                        (Service layer)
│   ├── auth.ts                 (signUp, signIn, signOut, getCurrentUser)
│   ├── patients.ts             (fetch, create, update, delete)
│   ├── appointments.ts
│   ├── consultations.ts
│   ├── prescriptions.ts
│   └── [12 more modules]
│
└── hooks/
    ├── useAuth.ts              (Get current user from session)
    ├── useClinic.ts            (Get clinic context)
    └── useRealtime.ts          (Realtime subscription setup)

components/
├── auth/
│   ├── LoginForm.tsx           (Client component: form only)
│   └── SignupForm.tsx
│
└── (dashboard)/
    ├── PatientCard.tsx
    ├── AppointmentCalendar.tsx
    └── [all other UI components]
```

---

## Scalability Considerations

| Aspect | 100 Users | 10K Users | 100K Users |
|--------|-----------|-----------|------------|
| RLS Overhead | Negligible | Monitor policies | Optimize policies |
| Realtime Load | 1-2 connections | 50-100 connections | Separate realtime instance |
| Query Performance | No indexing needed | Add clinic_id indexes | Partial indexes on active records |
| Pagination | Not needed | Implement limit/offset | Cursor-based pagination |
| JWT Token Size | < 1KB | < 2KB | Monitor cookie size |

**Strategy:** Don't optimize until needed. Monitor at 10K users, then optimize based on metrics.

---

## Sources

- **Supabase Guides:** https://supabase.com/docs
- **Next.js App Router:** https://nextjs.org/docs/app
- **Server Components:** https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **Server Actions:** https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

---

**Architecture Research Complete**  
**Ready for:** Phase 1 implementation with clear component boundaries and data flow
