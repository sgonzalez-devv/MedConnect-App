"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { ClinicProvider } from "@/context/clinic-context"
import { Toaster } from "@/components/ui/sonner"
import { PageTransition } from "@/components/page-transition"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // Redirect to login if not authenticated (fallback for middleware)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [loading, user, router])

  // Fire navigation-start event on every internal link click so the
  // PageTransition progress bar starts immediately (before the route resolves)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("http") || href.startsWith("#") || anchor.target === "_blank") return
      window.dispatchEvent(new Event("navigation-start"))
    }
    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
        {/* Animated logo / pulse ring */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-30 animate-ping" />
          <span className="relative inline-flex rounded-full h-10 w-10 bg-teal-500 items-center justify-center">
            <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Cargando aplicación…</p>
      </div>
    )
  }

  if (!user) {
    return null
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
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </ClinicProvider>
  )
}
