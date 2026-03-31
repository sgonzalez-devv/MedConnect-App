"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import type { Appointment, Patient } from "@/lib/types"

const estadoConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Programada", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmada", color: "bg-teal-100 text-teal-700" },
  in_progress: { label: "En curso", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "Completada", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700" },
  no_show: { label: "No asistió", color: "bg-gray-100 text-gray-700" },
}

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { session } = useAuth()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  }), [session?.access_token])

  useEffect(() => {
    async function fetchData() {
      if (!session?.access_token) return

      try {
        setLoading(true)
        setError(null)

        const aptRes = await fetch(`/api/appointments/${id}`, {
          headers: authHeaders(),
        })

        if (!aptRes.ok) {
          if (aptRes.status === 404) {
            setError("Cita no encontrada")
            return
          }
          const errData = await aptRes.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP ${aptRes.status}`)
        }

        const aptJson = await aptRes.json()
        const aptData: Appointment = aptJson.data
        setAppointment(aptData)

        if (aptData.patient_id) {
          const patRes = await fetch(`/api/patients/${aptData.patient_id}`, {
            headers: authHeaders(),
          })
          if (patRes.ok) {
            const patJson = await patRes.json()
            setPatient(patJson.data)
          }
        }
      } catch (err: any) {
        const message = err.message || "Error al cargar la cita"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, session?.access_token, authHeaders])

  const updateStatus = async (newStatus: string) => {
    if (!appointment || !session?.access_token) return

    try {
      setUpdating(true)
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const json = await res.json()
      setAppointment(json.data)
      toast.success("Estado actualizado")
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-muted rounded w-full animate-pulse" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-muted rounded w-full animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error || "Cita no encontrada"}</p>
          <Button variant="outline" asChild>
            <Link href="/calendario">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Calendario
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const estado = estadoConfig[appointment.status]
  const initials = patient
    ? patient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  const appointmentDate = appointment.fecha
    ? new Date(appointment.fecha)
    : new Date(appointment.appointment_datetime)
  const formattedDate = appointmentDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/calendario">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detalle de Cita</h1>
            <p className="text-muted-foreground">ID: {appointment.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Modificar
          </Button>
          {appointment.status !== "cancelled" && appointment.status !== "completed" && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => updateStatus("cancelled")}
              disabled={updating}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información de la Cita</CardTitle>
              <Badge className={estado?.color || "bg-gray-100 text-gray-700"}>
                {estado?.label || appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium text-foreground capitalize">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-medium text-foreground">
                    {appointment.hora} ({appointment.duration_minutes} min)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Detalles</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Motivo:</span>
                  <p className="font-medium text-foreground mt-1">{appointment.reason_for_visit || "Sin motivo especificado"}</p>
                </div>
                {appointment.notes && (
                  <div>
                    <span className="text-muted-foreground">Notas:</span>
                    <p className="text-foreground mt-1">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Acciones Rápidas</h4>
              <div className="flex flex-wrap gap-2">
                {appointment.status === "scheduled" && (
                  <Button
                    variant="outline"
                    className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    onClick={() => updateStatus("confirmed")}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Cita
                  </Button>
                )}
                {(appointment.status === "confirmed" || appointment.status === "scheduled") && (
                  <>
                    <Button
                      variant="outline"
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => updateStatus("in_progress")}
                      disabled={updating}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Iniciar Consulta
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => updateStatus("no_show")}
                      disabled={updating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Marcar No Asistió
                    </Button>
                  </>
                )}
                {appointment.status === "in_progress" && (
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => updateStatus("completed")}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completar Cita
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {patient.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.date_of_birth
                        ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} años`
                        : ''}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {patient.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{patient.address}</span>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/pacientes/${patient.id}`}>
                    <User className="w-4 h-4 mr-2" />
                    Ver Perfil Completo
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Cargando información del paciente...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
