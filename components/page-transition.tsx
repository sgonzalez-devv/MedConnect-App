"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const prevPathname = useRef(pathname)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname

      // Clear any pending timers
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)

      // Complete the bar and then fade out
      setProgress(100)
      hideTimeout.current = setTimeout(() => {
        setVisible(false)
        setIsNavigating(false)
        setProgress(0)
      }, 400)
    }
  }, [pathname])

  // Expose a way to start progress from the NavigationLoader
  useEffect(() => {
    const handleStart = () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)

      setProgress(0)
      setVisible(true)
      setIsNavigating(true)

      let current = 0
      progressInterval.current = setInterval(() => {
        // Ease toward ~85% asymptotically
        current += (85 - current) * 0.08
        setProgress(current)
        if (current >= 84.9) {
          if (progressInterval.current) clearInterval(progressInterval.current)
        }
      }, 80)
    }

    window.addEventListener("navigation-start", handleStart)
    return () => {
      window.removeEventListener("navigation-start", handleStart)
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [])

  return (
    <>
      {/* Top progress bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-9999 h-0.75 pointer-events-none"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
      >
        <div
          className="h-full bg-linear-to-r from-teal-400 via-teal-500 to-emerald-400 shadow-[0_0_8px_rgba(20,184,166,0.7)]"
          style={{
            width: `${progress}%`,
            transition: progress === 100
              ? "width 300ms cubic-bezier(0.4,0,0.2,1)"
              : "width 80ms linear",
          }}
        />
      </div>

      {/* Page content wrapper with fade */}
      <div
        key={pathname}
        className="animate-in fade-in duration-200"
      >
        {children}
      </div>
    </>
  )
}
