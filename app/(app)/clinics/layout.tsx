'use client'

import { use, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useClinicContext } from '@/hooks/use-clinic-context'
import { generateClinicCSSVariables } from '@/lib/theme-utils'

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const clinicId = params?.clinicId as string | undefined
  const { currentClinic, setCurrentClinicId } = useClinicContext()

  useEffect(() => {
    if (clinicId) setCurrentClinicId(clinicId)
  }, [clinicId, setCurrentClinicId])

  const cssVars = currentClinic
    ? (generateClinicCSSVariables(currentClinic.colorPalette) as React.CSSProperties)
    : {}

  return (
    <div style={cssVars}>
      {children}
    </div>
  )
}
