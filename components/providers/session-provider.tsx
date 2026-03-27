"use client"
import { useAuth } from "@/hooks/use-auth"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  // Initialize auth state - useAuth hook manages global session
  useAuth()
  return <>{children}</>
}
