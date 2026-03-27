"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { ClinicProvider } from "@/context/clinic-context"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // Redirect to login if not authenticated (fallback for middleware)
  if (!loading && !user) {
    router.push("/auth/login")
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <ClinicProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {user && (
              <div className="flex-1 flex items-center justify-end gap-4">
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user.email}</p>
                  {user.clinic_id && (
                    <p className="text-xs text-muted-foreground">
                      {user.clinic_id} • {user.user_role}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            )}
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ClinicProvider>
  )
}
