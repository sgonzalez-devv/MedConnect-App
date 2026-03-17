"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreVertical,
  CalendarDays,
  CalendarIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAppointmentsWithPatients } from "@/lib/mock-data"
import { formatDateWithWeekday, formatDateShort } from "@/lib/date-utils"
import type { Appointment, Patient } from "@/lib/types"

const estadoConfig: Record<string, { label: string; color: string }> = {
  programada: { label: "Programada", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmada: { label: "Confirmada", color: "bg-teal-100 text-teal-700 border-teal-200" },
  en_curso: { label: "En curso", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  completada: { label: "Completada", color: "bg-green-100 text-green-700 border-green-200" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200" },
  no_asistio: { label: "No asistió", color: "bg-gray-100 text-gray-700 border-gray-200" },
}

const tipoConfig: Record<string, { label: string; color: string }> = {
  consulta: { label: "Consulta", color: "bg-blue-500" },
  seguimiento: { label: "Seguimiento", color: "bg-teal-500" },
  urgencia: { label: "Urgencia", color: "bg-red-500" },
  revision: { label: "Revisión", color: "bg-indigo-500" },
}

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week">("day")

  const allAppointments = getAppointmentsWithPatients()

  // Format date consistently
  const formatDateStr = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const selectedDateStr = formatDateStr(selectedDate)

  const filteredAppointments = allAppointments.filter(
    (apt) => apt.fecha === selectedDateStr
  )

  // Sort by time
  const sortedAppointments = [...filteredAppointments].sort((a, b) =>
    a.hora.localeCompare(b.hora)
  )

  // Get dates that have appointments with their types
  const appointmentsByDate = allAppointments.reduce((acc, apt) => {
    if (!acc[apt.fecha]) {
      acc[apt.fecha] = new Set<string>()
    }
    acc[apt.fecha].add(apt.tipo)
    return acc
  }, {} as Record<string, Set<string>>)

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    
    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month padding
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()
  const todayStr = formatDateStr(today)

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
            <p className="text-muted-foreground">Gestiona tus citas del día</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="btn-secondary" asChild>
                <Link href="/calendario/nueva-cita">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Crear una nueva cita manualmente</TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <Card className="xl:col-span-1 card-hover">
            <CardContent className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="hover:bg-teal-50">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mes anterior</TooltipContent>
                </Tooltip>
                <h3 className="font-semibold text-foreground">
                  {MESES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="hover:bg-teal-50">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mes siguiente</TooltipContent>
                </Tooltip>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                  const dateStr = formatDateStr(date)
                  const isSelected = dateStr === selectedDateStr
                  const isToday = dateStr === todayStr
                  const appointmentTypes = appointmentsByDate[dateStr]
                  const hasAppointments = !!appointmentTypes
                  
                  // Get unique types for this date (up to 4 dots)
                  const typeColors = hasAppointments 
                    ? Array.from(appointmentTypes).slice(0, 4).map(tipo => tipoConfig[tipo]?.color || "bg-blue-500")
                    : []
                  
                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedDate(date)}
                          className={`
                            relative p-2 text-sm rounded-lg transition-all duration-200 font-medium
                            ${!isCurrentMonth ? "text-muted-foreground/40" : "text-foreground"}
                            ${isSelected 
                              ? "bg-teal-600 text-white shadow-md" 
                              : isToday 
                                ? "bg-teal-100 text-teal-700 ring-2 ring-teal-300" 
                                : "hover:bg-teal-50"}
                          `}
                        >
                          {date.getDate()}
                          {hasAppointments && !isSelected && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {typeColors.map((color, i) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${color}`} />
                              ))}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatDateShort(date)}
                        {hasAppointments && (
                          <>
                            {" - "}
                            {Array.from(appointmentTypes).map(t => tipoConfig[t]?.label).join(", ")}
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  Tipos de Cita
                </h4>
                <div className="space-y-2">
                  {Object.entries(tipoConfig).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${value.color}`} />
                      <span className="text-sm text-muted-foreground">{value.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-200"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Ir a Hoy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver las citas de hoy</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="xl:col-span-3 card-hover">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateDate("prev")}
                        className="hover:bg-teal-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Día anterior</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateDate("next")}
                        className="hover:bg-teal-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Día siguiente</TooltipContent>
                  </Tooltip>
                </div>
                <CardTitle className="text-lg capitalize">
                  {formatDateWithWeekday(selectedDate)}
                </CardTitle>
              </div>
              <Select value={view} onValueChange={(v) => setView(v as "day" | "week")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Día</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {sortedAppointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    Sin citas programadas
                  </p>
                  <p className="text-muted-foreground mb-6">
                    No hay citas para esta fecha. Puedes crear una nueva cita.
                  </p>
                  <Button className="btn-secondary" asChild>
                    <Link href="/calendario/nueva-cita">
                      <Plus className="w-4 h-4 mr-2" />
                      Agendar Cita
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      patient={appointment.paciente}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}

function AppointmentCard({
  appointment,
  patient,
}: {
  appointment: Appointment
  patient: Patient
}) {
  const estado = estadoConfig[appointment.estado] || estadoConfig.programada
  const tipo = tipoConfig[appointment.tipo] || tipoConfig.consulta

  return (
    <TooltipProvider>
      <Link
        href={`/calendario/cita/${appointment.id}`}
        className="flex items-stretch rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
      >
        {/* Left accent bar */}
        <div className={`w-1.5 ${tipo.color} group-hover:w-2 transition-all duration-200`} />

        <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
          {/* Time */}
          <div className="text-center md:min-w-20">
            <p className="text-lg font-bold text-foreground">{appointment.hora}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground cursor-help">{appointment.duracion} min</p>
              </TooltipTrigger>
              <TooltipContent>Duración de la cita</TooltipContent>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-border" />

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground truncate group-hover:text-teal-700 transition-colors duration-200">
                {patient.nombre} {patient.apellido}
              </p>
              {appointment.creadoPorBot && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs shrink-0 bg-green-50 text-green-700 border-green-200">
                      Bot
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Esta cita fue agendada por el bot de WhatsApp</TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {appointment.motivo}
            </p>
          </div>

          {/* Type & Status */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {tipo.label}
            </Badge>
            <Badge className={`text-xs border ${estado.color}`}>
              {estado.label}
            </Badge>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-teal-50"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Más opciones</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/calendario/cita/${appointment.id}`}>
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/pacientes/${patient.id}`}>
                  Ver paciente
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive cursor-pointer">
                Cancelar cita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
    </TooltipProvider>
  )
}
