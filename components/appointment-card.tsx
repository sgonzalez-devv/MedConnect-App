import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Appointment, Patient } from "@/lib/types"

interface AppointmentCardProps {
  appointment: Appointment
  patient: Patient
  compact?: boolean
}

const statusConfig: Record<string, { label: string; class: string }> = {
  programada: { label: "Programada", class: "bg-blue-50 text-blue-700 border-blue-200" },
  confirmada: { label: "Confirmada", class: "bg-green-50 text-green-700 border-green-200" },
  en_curso: { label: "En curso", class: "bg-amber-50 text-amber-700 border-amber-200" },
  completada: { label: "Completada", class: "bg-gray-100 text-gray-700 border-gray-200" },
  cancelada: { label: "Cancelada", class: "bg-red-50 text-red-700 border-red-200" },
  no_asistio: { label: "No asistió", class: "bg-orange-50 text-orange-700 border-orange-200" }
}

const typeConfig: Record<string, { label: string; class: string }> = {
  consulta: { label: "Consulta", class: "bg-indigo-50 text-indigo-700" },
  seguimiento: { label: "Seguimiento", class: "bg-teal-50 text-teal-700" },
  urgencia: { label: "Urgencia", class: "bg-red-50 text-red-700" },
  revision: { label: "Revisión", class: "bg-amber-50 text-amber-700" }
}

export function AppointmentCard({ appointment, patient, compact = false }: AppointmentCardProps) {
  const status = statusConfig[appointment.estado] || statusConfig.programada
  const type = typeConfig[appointment.tipo] || typeConfig.consulta
  const initials = `${patient.nombre[0]}${patient.apellido[0]}`

  if (compact) {
    return (
      <Link href={`/calendario/cita/${appointment.id}`}>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
            <Clock className="h-4 w-4" />
            {appointment.hora}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {patient.nombre} {patient.apellido}
            </p>
          </div>
          <Badge variant="outline" className={type.class}>
            {type.label}
          </Badge>
        </div>
      </Link>
    )
  }

  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link 
                href={`/pacientes/${patient.id}`}
                className="text-sm font-medium text-foreground hover:text-teal-600 transition-colors"
              >
                {patient.nombre} {patient.apellido}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {appointment.hora} ({appointment.duracion} min)
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={type.class}>
                  {type.label}
                </Badge>
                <Badge variant="outline" className={status.class}>
                  {status.label}
                </Badge>
              </div>
              {appointment.notas && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                  {appointment.notas}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/calendario/cita/${appointment.id}`}>Ver detalles</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Confirmar cita</DropdownMenuItem>
              <DropdownMenuItem>Reagendar</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
