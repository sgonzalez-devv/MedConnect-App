'use client'

import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import type { Clinic } from '@/lib/types'
import { clinics as mockClinics } from '@/lib/mock-data'

type ClinicContextProps = {
  currentClinicId: string | null
  currentClinic: Clinic | null
  clinics: Clinic[]
  setCurrentClinicId: (id: string) => void
}

const ClinicContext = createContext<ClinicContextProps | null>(null)

/**
 * Hook to access clinic context
 * Must be used within ClinicProvider
 * Throws error if context is not available
 */
export function useClinicContext() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinicContext must be used within ClinicProvider')
  }
  return context
}

/**
 * ClinicProvider component
 * Manages current clinic selection and provides clinic data to the app
 * Wraps the app with clinic context
 * 
 * IMPORTANT: Uses useMemo to prevent unnecessary re-renders on context change
 * (See RESEARCH.md Pitfall 1: Clinic Context Changes Trigger Full Re-render)
 */
export function ClinicProvider({ children }: { children: ReactNode }) {
  const [currentClinicId, setCurrentClinicId] = useState<string>('clinic-001')

  // Compute current clinic from clinics array
  const currentClinic = mockClinics.find((c) => c.id === currentClinicId) || null

  // Memoize context value to prevent unnecessary re-renders
  // Only re-compute when currentClinicId changes
  const value = useMemo(
    () => ({
      currentClinicId,
      currentClinic,
      clinics: mockClinics,
      setCurrentClinicId,
    }),
    [currentClinicId]
  )

  return (
    <ClinicContext.Provider value={value}>
      {children}
    </ClinicContext.Provider>
  )
}
