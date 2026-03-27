"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ProfilePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No user data available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold tracking-tight mb-8">Your Profile</h1>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and clinic assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <p className="text-base font-medium text-foreground">
                {user.email}
              </p>
            </div>

            {/* Clinic ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Clinic ID
              </label>
              <p className="text-base font-medium text-foreground">
                {user.clinic_id || "Not assigned"}
              </p>
              <p className="text-xs text-muted-foreground">
                Server-verified clinic assignment (not user-editable)
              </p>
            </div>

            {/* User Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="text-base font-medium text-foreground capitalize">
                {user.user_role || "Not assigned"}
              </p>
              <p className="text-xs text-muted-foreground">
                Access level within the clinic
              </p>
            </div>

            {/* Full Name (if available) */}
            {user.full_name && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-base font-medium text-foreground">
                  {user.full_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password periodically for security
                </p>
              </div>
              <Link href="/auth/reset-password">
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
