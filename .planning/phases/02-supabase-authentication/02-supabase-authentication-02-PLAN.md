---
phase: 02-supabase-authentication
plan: 02
type: execute
wave: 1
depends_on: ["02-supabase-authentication-01"]
files_modified: ["app/(app)/layout.tsx", "app/dashboard/profile/page.tsx"]
autonomous: true
requirements: ["AUTH-07", "USER-04"]
gap_closure: true

must_haves:
  truths:
    - "User can click logout button in header and session is invalidated"
    - "User can navigate to /dashboard/profile and see their profile information"
    - "Profile page displays email, clinic_id, user_role clearly"
  artifacts:
    - path: "app/(app)/layout.tsx"
      provides: "Logout button wired to signOut method"
      min_lines: 60
    - path: "app/dashboard/profile/page.tsx"
      provides: "Dedicated profile page with user details"
      min_lines: 40
  key_links:
    - from: "app/(app)/layout.tsx"
      to: "hooks/use-auth.ts"
      via: "useAuth hook call to access signOut method"
      pattern: "signOut"
    - from: "app/dashboard/profile/page.tsx"
      to: "hooks/use-auth.ts"
      via: "useAuth hook to access user data"
      pattern: "useAuth.*user"
---

<objective>
Close 2 gaps from Phase 02-1 verification: add logout button to header (AUTH-07) and create dedicated profile page (USER-04).

Purpose: Complete the authentication user experience by allowing users to explicitly log out and view their full profile details on a dedicated page.
Output: Updated header with logout button + new profile page component
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-supabase-authentication/02-supabase-authentication-01-SUMMARY.md
@.planning/phases/02-supabase-authentication/02-VERIFICATION.md

## Key Types from Previous Phase

From `hooks/use-auth.ts`:
```typescript
interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): AuthContextType;
```

From `lib/types.ts`:
```typescript
interface AuthUser {
  id: string;
  email: string;
  clinic_id: string;
  user_role: "admin" | "doctor" | "staff";
  full_name?: string;
}
```

From `app/(app)/layout.tsx`:
```typescript
// Current header display (lines 40-51):
// Shows user email, clinic_id, user_role in a div but no logout button
// Structure: <div className="flex items-center gap-4">...</div>
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add logout button to header</name>
  <files>app/(app)/layout.tsx</files>
  <action>
In `app/(app)/layout.tsx`, update the header user display section (around lines 40-51) to add a logout button:

1. Import Button component from your UI library (shadcn/ui likely)
2. Add a new Button element next to user info with:
   - Label: "Log Out" or "Logout"
   - onClick handler that calls `signOut()` from useAuth hook
   - Styling: secondary or destructive variant, similar size to other header elements
3. The signOut() call will:
   - Clear Supabase session via `supabase.auth.signOut()`
   - Clear user state in hook
   - Middleware will catch 401 and redirect to /auth/login on next request

4. Test structure:
   - Verify button appears in header next to user email/clinic info
   - No TS errors on signOut call
   - Button has proper className and variant styling

Reference: signOut is available from `const { user, session, loading, signOut } = useAuth();` (line 16)

Per gap closure: "User can log out and session is invalidated" (currently signOut exists but not exposed in UI)
  </action>
  <verify>
    <automated>grep -n "Log[Oo]ut" app/\(app\)/layout.tsx && npm run build 2>&1 | grep -v "warning" | grep -i error</automated>
  </verify>
  <done>Logout button present in header, onClick handler wired to signOut, TypeScript compilation succeeds with no errors</done>
</task>

<task type="auto">
  <name>Task 2: Create dedicated profile page</name>
  <files>app/dashboard/profile/page.tsx</files>
  <action>
Create a new profile page at `app/dashboard/profile/page.tsx` that displays user profile information:

1. Create the file with proper Next.js page component structure
2. Use useAuth hook to get current user data: email, clinic_id, user_role
3. Render profile information:
   - Display user email
   - Display clinic_id (server-verified, not user-editable per USER-03)
   - Display user_role (admin | doctor | staff)
   - Optional: Display full_name if available
   - Add a heading: "Your Profile" or similar
4. Layout:
   - Use same layout pattern as other dashboard pages (protected by middleware)
   - Add back navigation link to /dashboard or similar
   - Consider card layout similar to other dashboard pages in the app
5. Optional (nice-to-have):
   - Display last login timestamp (if available from session)
   - Add a "change password" link to /auth/reset-password
   - Add account security info (email verified status if available)

Structure pattern from existing pages:
- Import useAuth from hooks/use-auth
- Call useAuth() to get user and loading state
- Handle loading state with skeleton or spinner
- No API calls needed — all data from JWT claims already in useAuth

Per gap closure: "User can view own profile with clinic assignments and role" (currently only in header)
  </action>
  <verify>
    <automated>ls -l app/dashboard/profile/page.tsx && npm run build 2>&1 | grep -v "warning" | grep -i error && grep -n "useAuth" app/dashboard/profile/page.tsx</automated>
  </verify>
  <done>Profile page created, displays email/clinic_id/user_role, TypeScript compilation succeeds, useAuth hook properly imported and used</done>
</task>

</tasks>

<verification>
After completion:
1. **Logout button test**: Navigate to /dashboard, verify logout button appears in header, click it, verify redirect to /auth/login and session cleared
2. **Profile page test**: Navigate to /dashboard/profile, verify page loads, displays user email, clinic_id, and user_role
3. **Type safety**: `npm run build` shows no TypeScript errors
4. **Navigation**: Profile page has back link or accessible from header/sidebar navigation
5. **Session isolation**: Both components use useAuth hook (same auth context), no duplication
</verification>

<success_criteria>
- [ ] Logout button present in header (app/(app)/layout.tsx)
- [ ] Logout button calls `signOut()` from useAuth hook
- [ ] Clicking logout redirects to /auth/login and clears session
- [ ] New profile page exists at app/dashboard/profile/page.tsx
- [ ] Profile page displays email, clinic_id, user_role from user object
- [ ] Profile page accessible and loads without errors
- [ ] TypeScript compilation succeeds
- [ ] Both gaps closed: AUTH-07 (logout UI) and USER-04 (dedicated profile page) now fully satisfied
</success_criteria>

<output>
After completion, create `.planning/phases/02-supabase-authentication/02-supabase-authentication-02-SUMMARY.md`

Summary should document:
- Logout button added to header with onClick -> signOut() wiring
- Profile page created with user info display (email, clinic_id, role)
- Requirements AUTH-07 and USER-04 now fully satisfied
- No changes to authentication foundation (Phase 2-1 still intact)
</output>
