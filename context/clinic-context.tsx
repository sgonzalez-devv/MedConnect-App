'use client'

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'

export interface UserClinic {
  id: string
  name: string
  location?: string
  email?: string
  telefono?: string
  colorPalette?: {
    presetName: string
    customSecondaryHex?: string
  }
}

type ClinicContextProps = {
  clinics: UserClinic[]
  currentClinicId: string | null
  currentClinic: UserClinic | null
  setCurrentClinicId: (id: string) => void
  loading: boolean
}

const ClinicContext = createContext<ClinicContextProps | null>(null)

export function useClinicContext() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error('useClinicContext must be used within ClinicProvider')
  }
  return context
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinics, setClinics] = useState<UserClinic[]>([])
  const [currentClinicId, setCurrentClinicId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClinics() {
      try {
        const res = await fetch('/api/clinics')
        if (!res.ok) return
        const json = await res.json()
        const data: UserClinic[] = (json.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          location: c.location,
          email: c.email,
          telefono: c.telefono,
          colorPalette: c.color_palette ?? c.colorPalette ?? { presetName: 'teal' },
        }))
        setClinics(data)
        if (data.length > 0 && !currentClinicId) {
          setCurrentClinicId(data[0].id)
        }
      } catch {
        // silently fail — pages handle their own auth errors
      } finally {
        setLoading(false)
      }
    }
    fetchClinics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currentClinic = useMemo(
    () => clinics.find((c) => c.id === currentClinicId) ?? null,
    [clinics, currentClinicId]
  )

  const value = useMemo(
    () => ({ clinics, currentClinicId, currentClinic, setCurrentClinicId, loading }),
    [clinics, currentClinicId, currentClinic, loading]
  )

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}
