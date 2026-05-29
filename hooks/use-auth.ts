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
    let mounted = true

    function applySession(session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> }; access_token: string; refresh_token: string; expires_at?: number } | null) {
      if (!session) {
        setUser(null)
        setSession(null)
        return
      }
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        clinic_id: session.user.user_metadata?.clinic_id as string | undefined,
        user_role: session.user.user_metadata?.user_role as AuthUser['user_role'],
        full_name: session.user.user_metadata?.full_name as string | undefined,
        profession: session.user.user_metadata?.profession as string | undefined,
      }
      setUser(user)
      setSession({
        user,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || 0,
      })
    }

    // Read session from storage immediately — avoids the async gap where
    // onAuthStateChange hasn't fired yet and loading stays true long enough
    // to trigger the AppLayout guard and redirect back to login.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      applySession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      applySession(session)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
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
