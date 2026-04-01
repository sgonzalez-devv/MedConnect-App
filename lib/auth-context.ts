/**
 * Server-side auth context helper
 *
 * Centralises the extraction of clinic_id and user_role from the Supabase JWT.
 *
 * WHY THIS EXISTS
 * ---------------
 * Supabase stores user metadata in the JWT under two possible keys:
 *   • user_metadata  – set by the user or by auth.updateUser()
 *   • app_metadata   – set server-side / admin API (more trusted)
 *
 * Custom claims added via auth.updateUser({ data: { clinic_id, user_role } })
 * end up in `user_metadata`.  We therefore read from `user_metadata` first and
 * fall back to `app_metadata` so the code works in both configurations.
 *
 * The corresponding RLS policies must mirror this same path
 * (see migrations/002_fix_rls_jwt_claims.sql).
 *
 * @requirement AUTH-01
 */

import { createClient } from '@/lib/supabase'

export interface ClinicContext {
  clinic_id: string
  user_role: 'admin' | 'doctor' | 'staff'
  user_id: string
  email: string
}

/**
 * Reads clinic_id and user_role from the authenticated user's JWT.
 *
 * Tries user_metadata first (set by auth.updateUser), then app_metadata
 * (set by admin API / Edge Functions).
 *
 * Returns null when:
 *  - The request is unauthenticated
 *  - The user exists but clinic_id / user_role are not set in their metadata
 */
export async function getClinicContext(): Promise<ClinicContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Try user_metadata first (auth.updateUser path), then app_metadata (admin API path)
  const clinic_id =
    user.user_metadata?.clinic_id ?? user.app_metadata?.clinic_id

  const user_role =
    user.user_metadata?.user_role ?? user.app_metadata?.user_role

  if (!clinic_id || !user_role) {
    return null
  }

  return {
    clinic_id,
    user_role: user_role as ClinicContext['user_role'],
    user_id: user.id,
    email: user.email ?? '',
  }
}
