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
