'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useClinicContext } from '@/hooks/use-clinic-context'

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const clinicId = params?.clinicId as string | undefined
  const { setCurrentClinicId } = useClinicContext()

  useEffect(() => {
    if (clinicId) setCurrentClinicId(clinicId)
  }, [clinicId, setCurrentClinicId])

  return <>{children}</>
}
