"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
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
  Bot,
  FileText,
} from "lucide-react"
import { getAppointmentsWithPatients, getPatientById } from "@/lib/mock-data"

const estadoConfig = {
  programada: { label: "Programada", color: "bg-blue-100 text-blue-700" },
  confirmada: { label: "Confirmada", color: "bg-teal-100 text-teal-700" },
  en_curso: { label: "En curso", color: "bg-indigo-100 text-indigo-700" },
  completada: { label: "Completada", color: "bg-green-100 text-green-700" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700" },
  no_asistio: { label: "No asistió", color: "bg-gray-100 text-gray-700" },
}

const tipoConfig = {
  consulta: { label: "Consulta", color: "bg-blue-500" },
  seguimiento: { label: "Seguimiento", color: "bg-teal-500" },
  urgencia: { label: "Urgencia", color: "bg-red-500" },
  revision: { label: "Revisión", color: "bg-indigo-500" },
}

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const appointments = getAppointmentsWithPatients()
  const appointment = appointments.find((a) => a.id === id)

  if (!appointment) {
    notFound()
  }

  const patient = appointment.paciente
  const estado = estadoConfig[appointment.estado]
  const tipo = tipoConfig[appointment.tipo]
  const initials = `${patient.nombre[0]}${patient.apellido[0]}`

  const appointmentDate = new Date(appointment.fecha)
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Detalle de Cita</h1>
              {appointment.creadoPorBot && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  Bot
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">ID: {appointment.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Modificar
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información de la Cita</CardTitle>
              <Badge className={estado.color}>{estado.label}</Badge>
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
                    {appointment.hora} ({appointment.duracion} min)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Type and Reason */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Detalles</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${tipo.color}`} />
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium text-foreground">{tipo.label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Motivo:</span>
                  <p className="font-medium text-foreground mt-1">{appointment.motivo}</p>
                </div>
                {appointment.notas && (
                  <div>
                    <span className="text-muted-foreground">Notas:</span>
                    <p className="text-foreground mt-1">{appointment.notas}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Acciones Rápidas</h4>
              <div className="flex flex-wrap gap-2">
                {appointment.estado === "programada" && (
                  <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Cita
                  </Button>
                )}
                {(appointment.estado === "confirmada" || appointment.estado === "programada") && (
                  <>
                    <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      <FileText className="w-4 h-4 mr-2" />
                      Iniciar Consulta
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-2" />
                      Marcar No Asistió
                    </Button>
                  </>
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
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {patient.nombre} {patient.apellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date().getFullYear() - new Date(patient.fechaNacimiento).getFullYear()} años
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{patient.telefono}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground truncate">{patient.email}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{patient.direccion}</span>
              </div>
            </div>

            {patient.alergias.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Alergias</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.alergias.map((alergia) => (
                      <Badge key={alergia} variant="destructive" className="text-xs">
                        {alergia}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href={`/pacientes/${patient.id}`}>
                <User className="w-4 h-4 mr-2" />
                Ver Perfil Completo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
