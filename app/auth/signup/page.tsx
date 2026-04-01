"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Signup is disabled — user accounts are provisioned manually by an admin.
 * Anyone landing on /auth/signup is redirected to the login page.
 */
export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth/login")
  }, [router])

  return null
}
