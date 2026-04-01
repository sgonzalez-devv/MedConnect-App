"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calendar,
  Users,
  Clock,
  MessageSquare,
  Plus,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Building2,
  ChevronRight,
  Rocket,
  X,
} from "lucide-react"
import {
  notifications,
  getConversationsWithPatients,
} from "@/lib/mock-data"
import { formatDateLong } from "@/lib/date-utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/error-handling"
import { apiClient } from "@/lib/api-client"
import type { Appointment } from "@/lib/types"

const estadoConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Programada", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmada", color: "bg-teal-100 text-teal-700" },
  in_progress: { label: "En curso", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "Completada", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700" },
  no_show: { label: "No asistió", color: "bg-gray-100 text-gray-700" },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientsCount, setPatientsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [setupBannerDismissed, setSetupBannerDismissed] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!user?.clinic_id) {
        // No clinic assigned yet → new user
        setIsNewUser(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const today = new Date().toISOString().split("T")[0]

        const [appointmentsRes, patientsRes] = await Promise.all([
          apiClient.get(`/api/appointments?fromDate=${today}&toDate=${today}`),
          apiClient.get(`/api/patients?limit=10000`),
        ])

        const fetchedAppointments = appointmentsRes.data?.data || []
        const fetchedCount = patientsRes.data?.total || patientsRes.data?.data?.length || 0

        setAppointments(fetchedAppointments)
        setPatientsCount(fetchedCount)

        // Show setup banner when there are no patients and no appointments
        if (fetchedCount === 0 && fetchedAppointments.length === 0) {
          setIsNewUser(true)
        }
      } catch (err) {
        const message = formatErrorMessage(err, "Fetching dashboard data")
        setError(message)
        toast.error(message)
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.clinic_id])

  const todayAppointments = appointments
  const unreadNotifications = notifications.filter((n) => !n.leida)
  const activeConversations = getConversationsWithPatients().filter(
    (c) => c.estado === "activa"
  )

  const stats = [
    {
      title: "Citas de Hoy",
      value: todayAppointments.length,
      description: `${todayAppointments.filter((a) => a.status === "confirmed").length} confirmadas`,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      tooltip: "Total de citas programadas para hoy",
    },
    {
      title: "Pacientes Totales",
      value: patientsCount,
      description: "Registrados en el sistema",
      icon: Users,
      color: "text-teal-600",
      bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
      borderColor: "border-teal-200",
      tooltip: "Número total de pacientes en tu base de datos",
    },
    {
      title: "Pendientes",
      value: unreadNotifications.length,
      description: "Notificaciones sin leer",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      tooltip: "Notificaciones que requieren tu atención",
    },
    {
      title: "Conversaciones",
      value: activeConversations.length,
      description: "Activas en WhatsApp",
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
      tooltip: "Conversaciones activas con pacientes por WhatsApp",
    },
  ]

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">

        {/* ── New-user setup banner ───────────────────────────────────────── */}
        {isNewUser && !setupBannerDismissed && (
          <Card className="border-teal-200 bg-linear-to-r from-teal-50 via-white to-teal-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.08),transparent_60%)] pointer-events-none" />
            <CardContent className="p-5">
              <button
                onClick={() => setSetupBannerDismissed(true)}
                className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-0.5">
                    ¡Bienvenido a MedConnect!
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tu cuenta está lista. Sigue estos pasos para configurar el sistema desde cero.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Step 1 – Clinic */}
                    <Link
                      href="/clinics/nueva"
                      className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
                    >
                      <div className="h-9 w-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-200 transition-colors">
                        <Building2 className="h-4 w-4 text-teal-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">1. Crear Clínica</p>
                        <p className="text-xs text-muted-foreground truncate">Registra tu primera clínica</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-600 transition-colors shrink-0" />
                    </Link>

                    {/* Step 2 – Patient */}
                    <Link
                      href="/pacientes/nuevo"
                      className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                        <Users className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">2. Agregar Paciente</p>
                        <p className="text-xs text-muted-foreground truncate">Registra tu primer paciente</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors shrink-0" />
                    </Link>

                    {/* Step 3 – Appointment */}
                    <Link
                      href="/calendario/nueva-cita"
                      className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                        <Calendar className="h-4 w-4 text-indigo-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">3. Crear Cita</p>
                        <p className="text-xs text-muted-foreground truncate">Agenda tu primera cita</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* ─────────────────────────────────────────────────────────────────── */}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido de vuelta. Aquí está el resumen de hoy.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" asChild className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-200">
                  <Link href="/pacientes/nuevo">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Paciente
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Registrar un nuevo paciente en el sistema</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="btn-primary" asChild>
                  <Link href="/calendario/nueva-cita">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cita
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agendar una nueva cita para un paciente</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Tooltip key={stat.title}>
              <TooltipTrigger asChild>
                <Card className={`card-hover border-l-4 ${stat.borderColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>{stat.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <Card className="xl:col-span-2 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Citas de Hoy
                </CardTitle>
                <CardDescription>
                  {formatDateLong(new Date())}
                </CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild className="hover:bg-teal-50 hover:text-teal-700 transition-all duration-200">
                    <Link href="/calendario">
                      Ver todas
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver calendario completo</TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border animate-pulse">
                      <div className="w-14 h-14 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-48" />
                      </div>
                      <div className="h-8 bg-muted rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No hay citas programadas para hoy</p>
                  <Button className="btn-primary" asChild>
                    <Link href="/calendario/nueva-cita">
                      <Plus className="w-4 h-4 mr-2" />
                      Agendar Cita
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      href={`/calendario/cita/${appointment.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-teal-50/50 hover:border-teal-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-teal-50 group-hover:to-teal-100 transition-all duration-200">
                        <Clock className="w-6 h-6 text-blue-600 group-hover:text-teal-600 transition-colors duration-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate group-hover:text-teal-700 transition-colors duration-200">
                            {appointment.patient?.full_name}
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Bot
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Cita agendada por el bot de WhatsApp</TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {appointment.reason_for_visit}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-foreground text-lg">{appointment.hora}</p>
                        <Badge
                          variant="secondary"
                          className={estadoConfig[appointment.status]?.color || "bg-gray-100 text-gray-700"}
                        >
                          {estadoConfig[appointment.status]?.label || appointment.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {todayAppointments.length > 4 && (
                    <div className="text-center pt-2">
                      <Button variant="link" asChild className="text-teal-600 hover:text-teal-700">
                        <Link href="/calendario">
                          Ver {todayAppointments.length - 4} citas más
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Notificaciones
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild className="hover:bg-amber-50 hover:text-amber-700 transition-all duration-200">
                      <Link href="/configuracion">
                        Ver todas
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver todas las notificaciones</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay notificaciones
                    </p>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                          !notification.leida ? "bg-amber-50/70 hover:bg-amber-50" : "hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                            !notification.leida ? "bg-amber-500 animate-pulse" : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.mensaje}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Conversations */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  WhatsApp
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild className="hover:bg-green-50 hover:text-green-700 transition-all duration-200">
                      <Link href="/bot-whatsapp">
                        Ver todo
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver todas las conversaciones</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay conversaciones activas
                    </p>
                  ) : (
                    activeConversations.slice(0, 3).map((conversation) => {
                      const lastMessage =
                        conversation.mensajes[conversation.mensajes.length - 1]
                      const initials = `${conversation.paciente?.full_name?.charAt(0) || ''}`

                      return (
                        <Link
                          key={conversation.id}
                          href={`/bot-whatsapp`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50/70 transition-all duration-200 group"
                        >
                          <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-green-200 transition-all duration-200">
                            <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 text-xs font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-green-700 transition-colors duration-200">
                              {conversation.paciente?.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {lastMessage.contenido}
                            </p>
                          </div>
                          {!lastMessage.leido && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                              </TooltipTrigger>
                              <TooltipContent>Mensaje sin leer</TooltipContent>
                            </Tooltip>
                          )}
                        </Link>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-hover bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/70 backdrop-blur">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-teal-700 font-medium">Rendimiento</p>
                    <p className="text-2xl font-bold text-teal-800">
                      {Math.round((todayAppointments.filter(a => a.status === 'completed').length / Math.max(todayAppointments.length, 1)) * 100)}%
                    </p>
                    <p className="text-xs text-teal-600">Citas completadas hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
