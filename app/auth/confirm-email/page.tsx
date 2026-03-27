"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We've sent a confirmation link to {email || "your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-primary" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Click the link in the email to verify your account and log in.
        </p>
      </CardContent>
    </Card>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  )
}
