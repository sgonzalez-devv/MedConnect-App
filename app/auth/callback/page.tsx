"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function CallbackContent() {
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

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  )
}
