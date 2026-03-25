"use client"

import { useClinicContext } from '@/hooks/use-clinic-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, ChevronDown } from 'lucide-react'

export function ClinicSelector() {
  const { currentClinic, clinics, setCurrentClinicId } = useClinicContext()

  if (!currentClinic) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span>{currentClinic.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {clinics.map((clinic) => (
          <DropdownMenuItem
            key={clinic.id}
            onClick={() => setCurrentClinicId(clinic.id)}
            className={currentClinic.id === clinic.id ? 'bg-accent' : ''}
          >
            {clinic.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
