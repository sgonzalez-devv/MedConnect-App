---
phase: 02-supabase-authentication
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [
  "middleware.ts",
  ".env.local.example",
  "app/layout.tsx",
  "lib/supabase.ts",
  "app/auth/layout.tsx",
  "app/auth/signup/page.tsx",
  "app/auth/login/page.tsx",
  "app/auth/callback/page.tsx",
  "app/auth/reset-password/page.tsx",
  "hooks/use-auth.ts",
  "lib/types.ts"
]
autonomous: true
requirements: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, USER-01, USER-02, USER-03, USER-04]
user_setup: []

must_haves:
  truths:
    - "User can create account with email and password"
    - "Email verification required before login"
    - "User can log in with verified email"
    - "Session persists across browser refresh"
    - "JWT contains clinic_id and user_role claims"
    - "User can log out and session is invalidated"
    - "User can reset password via email link"
    - "Session expires after 7 days of inactivity"
  artifacts:
    - path: "middleware.ts"
      provides: "Session validation and refresh on every request"
      exports: ["default middleware function"]
    - path: "lib/supabase.ts"
      provides: "Supabase client initialization and hooks"
      exports: ["createClient", "useSupabase", "useUser"]
    - path: "app/auth/signup/page.tsx"
      provides: "User registration with email/password"
      exports: ["default SignupPage component"]
    - path: "app/auth/login/page.tsx"
      provides: "User login with email/password"
      exports: ["default LoginPage component"]
  key_links:
    - from: "middleware.ts"
      to: "lib/supabase.ts"
      via: "session validation"
      pattern: "createClient.*middleware context"
    - from: "app/auth/login/page.tsx"
      to: "lib/supabase.ts"
      via: "signInWithPassword call"
      pattern: "supabase.auth.signInWithPassword"
    - from: "app/(app)/layout.tsx"
      to: "lib/supabase.ts"
      via: "useUser hook for protected routes"
      pattern: "const { user } = useUser"
---

<objective>
Implement Supabase authentication with session management, email verification, and JWT custom claims for clinic context.

**Purpose:** Replace mock authentication with real Supabase Auth. Users can sign up, verify email, log in, maintain sessions across device refresh, and logout.

**Output:** 
- Working authentication flows (signup, login, logout, password reset)
- Middleware validating session on every request
- Supabase client with type-safe hooks
- Protected routes with clinic context verification
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/PROJECT.md (MedConnect context)
@.planning/STATE.md (Milestone state and decisions)
@.planning/ROADMAP.md (Phase 1 goal and success criteria)
@.planning/REQUIREMENTS.md (AUTH-01 through AUTH-07, USER-01 through USER-04)
@.planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (Architecture decisions, package choices)
@.planning/codebase/STACK.md (Next.js 16, TypeScript, React 19, no existing auth)
@.planning/codebase/CONVENTIONS.md (File naming, component patterns, hooks conventions)
@.planning/codebase/ARCHITECTURE.md (Current layout structure, entry points, routing)
</context>

<interfaces>
<!-- Key types and existing patterns the executor will need -->

From lib/types.ts (existing, to be extended):
```typescript
export interface User {
  id: string
  email: string
  // Will add: clinic_id, role, full_name after Phase 1
}

export interface Patient {
  id: string
  nombre: string
  apellido: string
  email: string
  // ... (existing fields, not modified in Phase 1)
}

// New types for Auth (Phase 1 addition):
export interface AuthUser {
  id: string // UUID from Supabase Auth
  email: string
  clinic_id: string // From JWT claims
  user_role: 'admin' | 'doctor' | 'staff'
  full_name?: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token?: string
  expires_at: number
}
```

From existing app structure (app/layout.tsx, app/(app)/layout.tsx):
```typescript
// Current: no auth provider
// Will add: SessionProvider wrapping children
// Current: no protected route checks
// Will add: useUser() hook checking in (app) layout
```

From existing hooks/use-toast.ts pattern (for reference):
```typescript
// Follows pattern: custom hook in hooks/ directory
// Returns object with methods/state
// Example for use-auth.ts to follow same pattern
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Install Supabase packages and configure environment</name>
  <files>package.json, .env.local.example, .env.local</files>
  <read_first>
    - package.json (check current versions, verify @supabase packages not present)
    - .planning/codebase/STACK.md (existing packages, dependencies)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (package recommendations)
  </read_first>
  <action>
    1. Add packages via pnpm:
       ```bash
       pnpm add @supabase/supabase-js@2.100.1 @supabase/ssr@0.9.0
       ```
    
    2. Create .env.local.example with Supabase configuration:
       ```env
       # Supabase Configuration (from your Supabase project settings)
       NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
       NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
       SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for server-side only)
       SUPABASE_AUTH_CONFIRM_EMAIL=true
       ```
    
    3. Create .env.local by copying .env.local.example
    
    4. Update .gitignore to include .env.local (if not already present)
    
    5. Verify installation:
       ```bash
       pnpm list @supabase/supabase-js @supabase/ssr
       ```
  </action>
  <acceptance_criteria>
    - package.json contains @supabase/supabase-js 2.100.1+
    - package.json contains @supabase/ssr 0.9.0+
    - .env.local.example exists with NEXT_PUBLIC_SUPABASE_URL placeholder
    - .env.local exists locally with valid Supabase project credentials
    - pnpm list command outputs both packages successfully
  </acceptance_criteria>
  <done>
    Supabase packages installed, environment configured with project credentials
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Supabase client wrapper and hooks</name>
  <files>lib/supabase.ts, lib/supabase-client.ts, hooks/use-auth.ts</files>
  <read_first>
    - lib/types.ts (understand existing type structure)
    - .planning/codebase/CONVENTIONS.md (hook naming: use-*, file patterns)
    - .planning/codebase/STACK.md (React 19, no existing auth framework)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (Section: @supabase/ssr integration pattern)
  </read_first>
  <action>
    1. Create lib/supabase-client.ts (client-side Supabase client):
       ```typescript
       "use client"
       
       import { createBrowserClient } from '@supabase/ssr'
       
       export function createClient() {
         return createBrowserClient(
           process.env.NEXT_PUBLIC_SUPABASE_URL!,
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
         )
       }
       ```
    
    2. Create lib/supabase.ts (server-side Supabase client):
       ```typescript
       import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
       import { cookies } from 'next/headers'
       
       export async function createClient() {
         const cookieStore = await cookies()
         
         return createServerClient(
           process.env.NEXT_PUBLIC_SUPABASE_URL!,
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
           {
             cookies: {
               getAll() {
                 return cookieStore.getAll()
               },
               setAll(cookiesToSet) {
                 try {
                   cookiesToSet.forEach(({ name, value, options }) =>
                     cookieStore.set(name, value, options)
                   )
                 } catch {
                   // Handle errors during cookie setting
                 }
               },
             },
           }
         )
       }
       ```
    
    3. Create hooks/use-auth.ts (client-side auth hook):
       ```typescript
       "use client"
       
       import { useCallback, useEffect, useState } from "react"
       import { createClient } from "@/lib/supabase-client"
       import type { AuthUser, AuthSession } from "@/lib/types"
       
       export function useAuth() {
         const [user, setUser] = useState<AuthUser | null>(null)
         const [session, setSession] = useState<AuthSession | null>(null)
         const [loading, setLoading] = useState(true)
         const supabase = createClient()
       
         useEffect(() => {
           const {
             data: { subscription },
           } = supabase.auth.onAuthStateChange((event, session) => {
             if (session) {
               const user: AuthUser = {
                 id: session.user.id,
                 email: session.user.email!,
                 clinic_id: session.user.user_metadata?.clinic_id,
                 user_role: session.user.user_metadata?.user_role,
                 full_name: session.user.user_metadata?.full_name,
               }
               setUser(user)
               setSession({
                 user,
                 access_token: session.access_token,
                 refresh_token: session.refresh_token,
                 expires_at: session.expires_at || 0,
               })
             } else {
               setUser(null)
               setSession(null)
             }
             setLoading(false)
           })
       
           return () => subscription?.unsubscribe()
         }, [supabase])
       
         const signUp = useCallback(async (email: string, password: string) => {
           return supabase.auth.signUp({ email, password })
         }, [supabase])
       
         const signIn = useCallback(async (email: string, password: string) => {
           return supabase.auth.signInWithPassword({ email, password })
         }, [supabase])
       
         const signOut = useCallback(async () => {
           return supabase.auth.signOut()
         }, [supabase])
       
         const resetPassword = useCallback(async (email: string) => {
           return supabase.auth.resetPasswordForEmail(email)
         }, [supabase])
       
         return {
           user,
           session,
           loading,
           signUp,
           signIn,
           signOut,
           resetPassword,
         }
       }
       ```
  </action>
  <acceptance_criteria>
    - lib/supabase-client.ts exports createClient function
    - lib/supabase.ts exports server-side createClient function
    - hooks/use-auth.ts exports useAuth hook with user, session, loading, signUp, signIn, signOut, resetPassword
    - All TypeScript compiles with no errors
    - Imports of types (AuthUser, AuthSession) work from lib/types.ts
  </acceptance_criteria>
  <done>
    Supabase client wrappers created with type-safe hooks for auth operations
  </done>
</task>

<task type="auto">
  <name>Task 3: Create middleware for session validation and refresh</name>
  <files>middleware.ts</files>
  <read_first>
    - .planning/codebase/ARCHITECTURE.md (Next.js App Router entry points)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (Section: Middleware Setup, Session Storage strategy)
    - app/layout.tsx (root layout structure)
  </read_first>
  <action>
    1. Create middleware.ts at project root (next to tsconfig.json):
       ```typescript
       import { type NextRequest } from 'next/server'
       import { updateSession } from '@/lib/supabase'
       
       export async function middleware(request: NextRequest) {
         return await updateSession(request)
       }
       
       export const config = {
         matcher: [
           /*
            * Match all request paths except for the ones starting with:
            * - api (API routes)
            * - _next/static (static files)
            * - _next/image (image optimization files)
            * - favicon.ico (favicon file)
            */
           '/((?!api|_next/static|_next/image|favicon.ico).*)',
         ],
       }
       ```
    
    2. Add updateSession function to lib/supabase.ts (server-side):
       ```typescript
       export async function updateSession(request: NextRequest) {
         let supabase = createServerClient(
           process.env.NEXT_PUBLIC_SUPABASE_URL!,
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
           {
             cookies: {
               getAll() {
                 return request.cookies.getAll()
               },
               setAll(cookiesToSet) {
                 const response = NextResponse.next()
                 cookiesToSet.forEach(({ name, value, options }) =>
                   response.cookies.set(name, value, options)
                 )
                 return response
               },
             },
           }
         )
       
         const { data: { user } } = await supabase.auth.getUser()
       
         if (!user && request.nextUrl.pathname.startsWith('/(app)')) {
           return NextResponse.redirect(new URL('/auth/login', request.url))
         }
       
         return NextResponse.next()
       }
       ```
  </action>
  <acceptance_criteria>
    - middleware.ts exists at project root
    - middleware.ts exports config with matcher pattern
    - middleware.ts imports and calls updateSession
    - updateSession exists in lib/supabase.ts and handles session refresh
    - TypeScript compiles without errors
    - Middleware can be run via `next build`
  </acceptance_criteria>
  <done>
    Middleware created to validate and refresh sessions on every request
  </done>
</task>

<task type="auto">
  <name>Task 4: Update root layout with SessionProvider</name>
  <files>app/layout.tsx</files>
  <read_first>
    - app/layout.tsx (current structure, imports, providers)
    - .planning/codebase/CONVENTIONS.md (import organization, component patterns)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (Section: Layout Provider responsibility)
  </read_first>
  <action>
    1. Add SessionProvider wrapper to app/layout.tsx:
       - After <ThemeProvider>, add <SessionProvider> component
       - SessionProvider should wrap {children}
       - Example structure:
         ```typescript
         <html>
           <body>
             <ThemeProvider attribute="class" defaultTheme="system">
               <SessionProvider>
                 <SidebarProvider>
                   {children}
                 </SidebarProvider>
               </SessionProvider>
             </ThemeProvider>
           </body>
         </html>
         ```
    
    2. Create components/providers/session-provider.tsx:
       ```typescript
       "use client"
       import { useAuth } from "@/hooks/use-auth"
       import { ReactNode } from "react"
       
       export function SessionProvider({ children }: { children: ReactNode }) {
         // Initialize auth state - useAuth hook manages global session
         useAuth()
         return <>{children}</>
       }
       ```
  </action>
  <acceptance_criteria>
    - app/layout.tsx imports SessionProvider
    - SessionProvider wraps children in layout
    - SessionProvider calls useAuth() hook to initialize auth state
    - No TypeScript errors after updates
  </acceptance_criteria>
  <done>
    Root layout updated to provide session context to entire app
  </done>
</task>

<task type="auto">
  <name>Task 5: Create authentication pages (signup, login, callback, reset)</name>
  <files>app/auth/layout.tsx, app/auth/signup/page.tsx, app/auth/login/page.tsx, app/auth/callback/page.tsx, app/auth/reset-password/page.tsx</files>
  <read_first>
    - .planning/codebase/CONVENTIONS.md (component patterns, form validation with React Hook Form + Zod)
    - .planning/codebase/STACK.md (Tailwind CSS, shadcn/ui components, Lucide icons)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (Email verification flow, password reset pattern, JWT claims requirement)
    - existing pages for form patterns (e.g., app/login/page.tsx if exists)
  </read_first>
  <action>
    1. Create app/auth/layout.tsx (public auth layout, no sidebar):
       ```typescript
       import type { ReactNode } from "react"
       
       export default function AuthLayout({ children }: { children: ReactNode }) {
         return (
           <div className="min-h-screen flex items-center justify-center bg-background">
             <div className="w-full max-w-md p-4">
               {children}
             </div>
           </div>
         )
       }
       ```
    
    2. Create app/auth/signup/page.tsx:
       ```typescript
       "use client"
       
       import { useState } from "react"
       import { useRouter } from "next/navigation"
       import Link from "next/link"
       import { useAuth } from "@/hooks/use-auth"
       import { Button } from "@/components/ui/button"
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
       import { Input } from "@/components/ui/input"
       import { Label } from "@/components/ui/label"
       import { Mail, Lock, AlertCircle } from "lucide-react"
       
       export default function SignupPage() {
         const [email, setEmail] = useState("")
         const [password, setPassword] = useState("")
         const [loading, setLoading] = useState(false)
         const [error, setError] = useState<string | null>(null)
         const router = useRouter()
         const { signUp } = useAuth()
       
         async function handleSignup(e: React.FormEvent) {
           e.preventDefault()
           setError(null)
           setLoading(true)
       
           try {
             const { error: signupError } = await signUp(email, password)
             if (signupError) throw signupError
       
             // Signup successful - redirect to confirmation page
             router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}`)
           } catch (err) {
             setError(err instanceof Error ? err.message : "Signup failed")
           } finally {
             setLoading(false)
           }
         }
       
         return (
           <Card>
             <CardHeader>
               <CardTitle>Create Account</CardTitle>
               <CardDescription>Sign up to access MedConnect</CardDescription>
             </CardHeader>
             <CardContent>
               <form onSubmit={handleSignup} className="space-y-4">
                 {error && (
                   <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                     <AlertCircle className="w-4 h-4 text-red-600" />
                     <p className="text-sm text-red-600">{error}</p>
                   </div>
                 )}
       
                 <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                     <Input
                       id="email"
                       type="email"
                       placeholder="you@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       className="pl-10"
                     />
                   </div>
                 </div>
       
                 <div className="space-y-2">
                   <Label htmlFor="password">Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                     <Input
                       id="password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       className="pl-10"
                     />
                   </div>
                 </div>
       
                 <Button type="submit" disabled={loading} className="w-full">
                   {loading ? "Creating account..." : "Sign Up"}
                 </Button>
               </form>
       
               <div className="mt-4 text-center text-sm">
                 Already have an account?{" "}
                 <Link href="/auth/login" className="text-primary hover:underline">
                   Sign in
                 </Link>
               </div>
             </CardContent>
           </Card>
         )
       }
       ```
    
    3. Create app/auth/login/page.tsx (similar pattern to signup, but calls signIn):
       - Use signIn instead of signUp
       - After successful login, redirect to /dashboard (middleware will validate session)
       - Include "Forgot password?" link to /auth/reset-password
       - Include "Create account" link to /auth/signup
    
    4. Create app/auth/callback/page.tsx (handles password reset + verification links):
       ```typescript
       "use client"
       
       import { useEffect } from "react"
       import { useRouter, useSearchParams } from "next/navigation"
       
       export default function CallbackPage() {
         const router = useRouter()
         const searchParams = useSearchParams()
       
         useEffect(() => {
           const type = searchParams.get("type")
       
           if (type === "recovery") {
             router.push("/auth/reset-password")
           } else if (type === "email_change") {
             router.push("/dashboard")
           } else {
             // Verify email or other callback
             router.push("/dashboard")
           }
         }, [router, searchParams])
       
         return (
           <div className="text-center">
             <p>Processing authentication...</p>
           </div>
         )
       }
       ```
    
    5. Create app/auth/reset-password/page.tsx (reset password form):
       - Get new password from user
       - Call supabase.auth.updateUser({ password: newPassword })
       - Redirect to login after successful reset
  </action>
  <acceptance_criteria>
    - app/auth/signup/page.tsx exists and contains signup form
    - app/auth/login/page.tsx exists and contains login form
    - app/auth/callback/page.tsx exists and handles callback types
    - app/auth/reset-password/page.tsx exists and handles password reset
    - All forms use React Hook Form + Zod for validation
    - Error messages displayed to user on form errors
    - Success redirects to appropriate pages
    - All TypeScript compiles
  </acceptance_criteria>
  <done>
    Authentication pages created with signup, login, password reset flows
  </done>
</task>

<task type="auto">
  <name>Task 6: Protect app routes and add clinic context verification</name>
  <files>app/(app)/layout.tsx</files>
  <read_first>
    - app/(app)/layout.tsx (current layout with sidebar)
    - .planning/codebase/ARCHITECTURE.md (app layout responsibilities)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (Protected routes, clinic context requirement USER-03)
    - hooks/use-auth.ts (the useAuth hook structure)
  </read_first>
  <action>
    1. Update app/(app)/layout.tsx to check user authentication:
       ```typescript
       "use client"
       
       import { useRouter } from "next/navigation"
       import { useAuth } from "@/hooks/use-auth"
       import { ReactNode } from "react"
       
       export default function AppLayout({ children }: { children: ReactNode }) {
         const router = useRouter()
         const { user, loading } = useAuth()
       
         // Redirect to login if not authenticated (fallback for middleware)
         if (!loading && !user) {
           router.push("/auth/login")
           return null
         }
       
         if (loading) {
           return <div>Loading...</div>
         }
       
         return (
           <div className="flex h-screen">
             <AppSidebar />
             <div className="flex-1 flex flex-col">
               <Header user={user} />
               <main className="flex-1 overflow-auto">
                 {children}
               </main>
             </div>
           </div>
         )
       }
       ```
    
    2. Add user display in header:
       - Show user email + clinic name + role in header
       - Example: "Dr. Juan Pérez | Clínica Central | Admin"
  </action>
  <acceptance_criteria>
    - app/(app)/layout.tsx calls useAuth hook
    - Unauthenticated users redirected to /auth/login
    - User email and clinic context displayed in header
    - Loading state handled gracefully
    - No TypeScript errors
  </acceptance_criteria>
  <done>
    Protected routes configured with user authentication checks and clinic context display
  </done>
</task>

<task type="auto">
  <name>Task 7: Update types.ts with AuthUser and AuthSession</name>
  <files>lib/types.ts</files>
  <read_first>
    - lib/types.ts (existing types like Patient, Appointment, etc.)
    - .planning/codebase/CONVENTIONS.md (type naming patterns: PascalCase)
    - .planning/phases/02-supabase-authentication/02-supabase-authentication-RESEARCH.md (JWT claims requirement: clinic_id, user_role)
  </read_first>
  <action>
    1. Add to lib/types.ts:
       ```typescript
       // Authentication types (Phase 1)
       export interface AuthUser {
         id: string // UUID from Supabase Auth
         email: string
         clinic_id: string // From JWT custom claims
         user_role: 'admin' | 'doctor' | 'staff'
         full_name?: string
       }
       
       export interface AuthSession {
         user: AuthUser
         access_token: string
         refresh_token?: string
         expires_at: number // Unix timestamp
       }
       ```
  </action>
  <acceptance_criteria>
    - lib/types.ts contains AuthUser interface with id, email, clinic_id, user_role, full_name
    - lib/types.ts contains AuthSession interface with user, access_token, refresh_token, expires_at
    - Existing types unchanged
    - TypeScript compiles
  </acceptance_criteria>
  <done>
    Type definitions for auth user and session added
  </done>
</task>

</tasks>

<verification>
After all tasks complete, verify Phase 1 success:

1. **Sign-up flow:**
   - Navigate to /auth/signup
   - Enter email + password
   - Submit form
   - Verify: Redirect to confirmation page with "Check your email" message
   - Verify: Supabase Auth user created (check Supabase dashboard)
   - Verify: Confirmation email sent (check email inbox or Supabase logs)

2. **Email verification:**
   - Click verification link in email
   - Verify: Redirected to /auth/callback then /dashboard
   - Verify: User marked as verified in Supabase Auth

3. **Login flow:**
   - Navigate to /auth/login
   - Enter verified email + password
   - Submit form
   - Verify: Redirect to /dashboard
   - Verify: User email displayed in header
   - Verify: Clinic context displayed (clinic_id and user_role in header)

4. **Session persistence:**
   - Login to /dashboard
   - Refresh page (Ctrl+R or Cmd+R)
   - Verify: Still logged in, no redirect to /auth/login
   - Verify: localStorage contains session (check browser dev tools)

5. **JWT claims verification:**
   - Open browser dev tools → Application → Cookies
   - Find session cookie
   - Decode token (use jwt.io or inspect in Network tab)
   - Verify: Token contains clinic_id claim
   - Verify: Token contains user_role claim

6. **Logout flow:**
   - Click logout button
   - Verify: Redirect to /auth/login
   - Verify: Session cookie cleared
   - Try to navigate to /dashboard
   - Verify: Redirected back to /auth/login

7. **Password reset flow:**
   - Navigate to /auth/login
   - Click "Forgot password?"
   - Enter email + submit
   - Verify: Message shows "Check your email"
   - Click reset link in email
   - Verify: Redirected to /auth/reset-password
   - Enter new password + submit
   - Verify: Can login with new password

8. **Protected routes:**
   - Logout
   - Try to navigate directly to /dashboard, /pacientes, etc.
   - Verify: Redirected to /auth/login via middleware
</verification>

<success_criteria>
Phase 1 complete when:
- ✅ Supabase Auth configured with email verification enabled
- ✅ Custom users table exists with clinic_id and role (manual setup)
- ✅ JWT custom claims injection working (clinic_id + role in token)
- ✅ All 7 authentication user scenarios pass (signup, email verify, login, logout, reset, session persist, clinic context)
- ✅ All 7 user management requirements pass (profile viewing, clinic assignment, role display)
- ✅ Middleware validates session on every request
- ✅ Protected routes redirect unauthenticated users to login
- ✅ No TypeScript errors in full build
- ✅ All 11 requirements (AUTH-01 through AUTH-07, USER-01 through USER-04) implemented

Ready for Phase 2: Database Schema & Row-Level Security (depends on: working Supabase Auth + JWT claims)
</success_criteria>

<output>
After completion, create `.planning/phases/02-supabase-authentication/02-supabase-authentication-01-SUMMARY.md` with:
- What was built (files modified/created)
- What's working (verification results)
- What's next (Phase 2 dependencies)
- Key learnings or gotchas
</output>
