'use client'

import { useEffect } from 'react'
import { useClinicContext } from '@/hooks/use-clinic-context'
import { generateClinicCSSVariables } from '@/lib/theme-utils'

export default function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { clinicId: string }
}) {
  const { currentClinic, setCurrentClinicId } = useClinicContext()

  useEffect(() => {
    setCurrentClinicId(params.clinicId)
  }, [params.clinicId, setCurrentClinicId])

  const cssVars = currentClinic
    ? (generateClinicCSSVariables(currentClinic.colorPalette) as React.CSSProperties)
    : {}

  return (
    <div style={cssVars}>
      {children}
    </div>
  )
}
