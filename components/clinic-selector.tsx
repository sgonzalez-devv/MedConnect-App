"use client"

import { useClinicContext } from '@/hooks/use-clinic-context'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, ChevronDown, Plus } from 'lucide-react'
import { clinics } from '@/lib/mock-data'

// Color map for clinic presets
const clinicColorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'teal': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    badge: 'bg-teal-200 text-teal-800'
  },
  'blue': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-200 text-blue-800'
  },
  'indigo': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-200 text-indigo-800'
  },
  'green': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-200 text-green-800'
  },
  'purple': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-200 text-purple-800'
  },
}

export function ClinicSelector() {
  const { currentClinic, setCurrentClinicId } = useClinicContext()
  const router = useRouter()

  if (!currentClinic) return null

  const colorPreset = clinicColorMap[currentClinic.colorPalette.presetName] || clinicColorMap['teal']
  const clinicInitials = currentClinic.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleClinicChange = (clinicId: string) => {
    setCurrentClinicId(clinicId)
    // Navigate to clinic dashboard
    router.push(`/clinics/${clinicId}/dashboard`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${colorPreset.border}`}>
          <div className="p-3 flex items-center gap-3 hover:bg-opacity-50">
            {/* Clinic Color Badge */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorPreset.bg} border ${colorPreset.border}`}>
              <Building2 className={`w-5 h-5 ${colorPreset.text}`} />
            </div>
            
            {/* Clinic Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${colorPreset.text}`}>
                {currentClinic.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentClinic.location}
              </p>
            </div>
            
            {/* Chevron */}
            <ChevronDown className={`w-4 h-4 ${colorPreset.text} flex-shrink-0`} />
          </div>
        </Card>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Selecciona una clínica
          </p>
        </div>
        <DropdownMenuSeparator />

        {clinics.map((clinic) => {
          const clinicColors = clinicColorMap[clinic.colorPalette.presetName] || clinicColorMap['teal']
          const isActive = currentClinic.id === clinic.id
          const initials = clinic.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return (
            <DropdownMenuItem
              key={clinic.id}
              onClick={() => handleClinicChange(clinic.id)}
              className={`cursor-pointer transition-all duration-200 ${isActive ? `${clinicColors.bg} border-l-4 ${clinicColors.border}` : ''}`}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Clinic Avatar with Color Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${clinicColors.bg} border ${clinicColors.border}`}>
                  <Building2 className={`w-4 h-4 ${clinicColors.text}`} />
                </div>
                
                {/* Clinic Details */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? clinicColors.text : ''}`}>
                    {clinic.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {clinic.location}
                  </p>
                </div>
                
                {/* Active Badge */}
                {isActive && (
                  <Badge className={`flex-shrink-0 ${clinicColors.badge}`}>
                    Activa
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />
        
        {/* Add New Clinic Link */}
        <DropdownMenuItem className="cursor-pointer" asChild>
          <a href="/configuracion?tab=clinics" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Agregar clínica</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
