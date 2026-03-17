"use client"

import { use, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Paperclip,
  MessageSquare,
  Plus,
  Droplet,
  AlertTriangle,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Syringe,
  Stethoscope,
  Users,
  Scissors,
  Building2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  getPatientById,
  getPatientAppointments,
  getPatientConsultationNotes,
  getPatientAttachments,
  getPatientVitalSigns,
  getPatientMedicalHistory,
  getPatientVaccines,
  whatsappConversations,
} from "@/lib/mock-data"

const estadoConfig: Record<string, { label: string; color: string }> = {
  programada: { label: "Programada", color: "bg-blue-100 text-blue-700" },
  confirmada: { label: "Confirmada", color: "bg-teal-100 text-teal-700" },
  en_curso: { label: "En curso", color: "bg-indigo-100 text-indigo-700" },
  completada: { label: "Completada", color: "bg-green-100 text-green-700" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700" },
  no_asistio: { label: "No asistió", color: "bg-gray-100 text-gray-700" },
}

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("resumen")
  const [medicalSubTab, setMedicalSubTab] = useState("signos")

  const patient = getPatientById(id)
  if (!patient) {
    notFound()
  }

  const appointments = getPatientAppointments(id)
  const consultationNotes = getPatientConsultationNotes(id)
  const attachments = getPatientAttachments(id)
  const vitalSigns = getPatientVitalSigns(id)
  const medicalHistory = getPatientMedicalHistory(id)
  const vaccines = getPatientVaccines(id)
  const conversations = whatsappConversations.filter((c) => c.pacienteId === id)

  const initials = `${patient.nombre[0]}${patient.apellido[0]}`
  const age = new Date().getFullYear() - new Date(patient.fechaNacimiento).getFullYear()

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.fecha) >= new Date() && a.estado !== "cancelada"
  )

  // Separate medical history by type
  const personalHistory = medicalHistory.filter((h) => h.tipo === "personal")
  const familyHistory = medicalHistory.filter((h) => h.tipo === "familiar")

  // Get latest vital signs
  const latestVitals = vitalSigns.length > 0 
    ? vitalSigns.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
    : null

  // Calculate BMI if we have latest vitals
  const bmi = latestVitals 
    ? (latestVitals.peso / Math.pow(latestVitals.talla / 100, 2)).toFixed(1)
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/pacientes">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {patient.nombre} {patient.apellido}
              </h1>
              <p className="text-muted-foreground">
                {age} años · {patient.genero === "masculino" ? "Masculino" : "Femenino"} · 
                Paciente desde {new Date(patient.fechaRegistro).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-12 lg:ml-0">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
            <Link href={`/calendario/nueva-cita?paciente=${id}`}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cita
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="citas">Historial Citas</TabsTrigger>
          <TabsTrigger value="medico">Expediente Médico</TabsTrigger>
          <TabsTrigger value="comunicaciones">Comunicaciones</TabsTrigger>
        </TabsList>

        {/* Resumen Tab */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium text-foreground">{patient.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium text-foreground">{patient.direccion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Médica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grupo Sanguíneo</p>
                    <p className="font-medium text-foreground">{patient.grupoSanguineo}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-foreground">Alergias</p>
                  </div>
                  {patient.alergias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patient.alergias.map((alergia) => (
                        <Badge key={alergia} variant="destructive" className="text-xs">
                          {alergia}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm font-medium text-foreground">Condiciones Crónicas</p>
                  </div>
                  {patient.condicionesCronicas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patient.condicionesCronicas.map((condicion) => (
                        <Badge key={condicion} variant="secondary" className="text-xs">
                          {condicion}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin condiciones registradas</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Expediente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Total citas</span>
                  </div>
                  <span className="font-semibold text-foreground">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-muted-foreground">Notas médicas</span>
                  </div>
                  <span className="font-semibold text-foreground">{consultationNotes.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span className="text-sm text-muted-foreground">Registros de signos</span>
                  </div>
                  <span className="font-semibold text-foreground">{vitalSigns.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Vacunas aplicadas</span>
                  </div>
                  <span className="font-semibold text-foreground">{vaccines.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Vital Signs Summary */}
          {latestVitals && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  Últimos Signos Vitales
                </CardTitle>
                <CardDescription>
                  Registrado el {new Date(latestVitals.fecha).toLocaleDateString("es-MX", { 
                    day: "numeric", month: "long", year: "numeric" 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{latestVitals.presionSistolica}/{latestVitals.presionDiastolica}</p>
                    <p className="text-xs text-muted-foreground">Presión (mmHg)</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg text-center">
                    <Activity className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{latestVitals.frecuenciaCardiaca}</p>
                    <p className="text-xs text-muted-foreground">FC (bpm)</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{latestVitals.temperatura}°C</p>
                    <p className="text-xs text-muted-foreground">Temperatura</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <Scale className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{latestVitals.peso} kg</p>
                    <p className="text-xs text-muted-foreground">Peso</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg text-center">
                    <Ruler className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{latestVitals.talla} cm</p>
                    <p className="text-xs text-muted-foreground">Talla</p>
                  </div>
                  {bmi && (
                    <div className="p-3 bg-teal-50 rounded-lg text-center">
                      <Activity className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-foreground">{bmi}</p>
                      <p className="text-xs text-muted-foreground">IMC</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximas Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/calendario/cita/${apt.id}`}
                      className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{apt.motivo}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.fecha).toLocaleDateString("es-MX", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })} a las {apt.hora}
                        </p>
                      </div>
                      <Badge className={estadoConfig[apt.estado]?.color || "bg-gray-100 text-gray-700"}>
                        {estadoConfig[apt.estado]?.label || apt.estado}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Historial Citas Tab */}
        <TabsContent value="citas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Citas</CardTitle>
              <CardDescription>
                {appointments.length} citas en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay citas registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .map((apt) => (
                      <Link
                        key={apt.id}
                        href={`/calendario/cita/${apt.id}`}
                        className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-center min-w-16">
                          <p className="text-2xl font-bold text-foreground">
                            {new Date(apt.fecha).getDate()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {new Date(apt.fecha).toLocaleDateString("es-MX", { month: "short" })}
                          </p>
                        </div>
                        <Separator orientation="vertical" className="h-12" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{apt.motivo}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.hora} · {apt.duracion} min · {apt.tipo}
                          </p>
                        </div>
                        <Badge className={estadoConfig[apt.estado]?.color || "bg-gray-100 text-gray-700"}>
                          {estadoConfig[apt.estado]?.label || apt.estado}
                        </Badge>
                      </Link>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expediente Médico Tab - ENHANCED */}
        <TabsContent value="medico" className="space-y-6">
          {/* Sub-navigation for medical records */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={medicalSubTab === "signos" ? "default" : "outline"}
              size="sm"
              onClick={() => setMedicalSubTab("signos")}
              className={medicalSubTab === "signos" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <Activity className="w-4 h-4 mr-2" />
              Signos Vitales
            </Button>
            <Button 
              variant={medicalSubTab === "antecedentes" ? "default" : "outline"}
              size="sm"
              onClick={() => setMedicalSubTab("antecedentes")}
              className={medicalSubTab === "antecedentes" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Antecedentes
            </Button>
            <Button 
              variant={medicalSubTab === "vacunas" ? "default" : "outline"}
              size="sm"
              onClick={() => setMedicalSubTab("vacunas")}
              className={medicalSubTab === "vacunas" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <Syringe className="w-4 h-4 mr-2" />
              Vacunas
            </Button>
            <Button 
              variant={medicalSubTab === "notas" ? "default" : "outline"}
              size="sm"
              onClick={() => setMedicalSubTab("notas")}
              className={medicalSubTab === "notas" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <FileText className="w-4 h-4 mr-2" />
              Notas de Consulta
            </Button>
            <Button 
              variant={medicalSubTab === "archivos" ? "default" : "outline"}
              size="sm"
              onClick={() => setMedicalSubTab("archivos")}
              className={medicalSubTab === "archivos" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Archivos
            </Button>
          </div>

          {/* Signos Vitales */}
          {medicalSubTab === "signos" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Historial de Signos Vitales</CardTitle>
                  <CardDescription>{vitalSigns.length} registros</CardDescription>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Registro
                </Button>
              </CardHeader>
              <CardContent>
                {vitalSigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Sin registros de signos vitales</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vitalSigns
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((vs, index) => {
                        const prevVs = vitalSigns[index + 1]
                        const weightChange = prevVs ? vs.peso - prevVs.peso : 0
                        
                        return (
                          <div key={vs.id} className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                  <Activity className="w-4 h-4 text-teal-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {new Date(vs.fecha).toLocaleDateString("es-MX", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                  {vs.citaId && (
                                    <p className="text-xs text-muted-foreground">Durante cita médica</p>
                                  )}
                                </div>
                              </div>
                              {index === 0 && (
                                <Badge className="bg-teal-100 text-teal-700">Más reciente</Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              <div className="text-center p-2 bg-red-50 rounded">
                                <p className="text-sm font-semibold text-foreground">{vs.presionSistolica}/{vs.presionDiastolica}</p>
                                <p className="text-xs text-muted-foreground">Presión</p>
                              </div>
                              <div className="text-center p-2 bg-pink-50 rounded">
                                <p className="text-sm font-semibold text-foreground">{vs.frecuenciaCardiaca} bpm</p>
                                <p className="text-xs text-muted-foreground">FC</p>
                              </div>
                              <div className="text-center p-2 bg-orange-50 rounded">
                                <p className="text-sm font-semibold text-foreground">{vs.temperatura}°C</p>
                                <p className="text-xs text-muted-foreground">Temp</p>
                              </div>
                              <div className="text-center p-2 bg-blue-50 rounded">
                                <div className="flex items-center justify-center gap-1">
                                  <p className="text-sm font-semibold text-foreground">{vs.peso} kg</p>
                                  {weightChange !== 0 && (
                                    <span className={`text-xs ${weightChange > 0 ? "text-red-500" : "text-green-500"}`}>
                                      {weightChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">Peso</p>
                              </div>
                              {vs.saturacionOxigeno && (
                                <div className="text-center p-2 bg-cyan-50 rounded">
                                  <p className="text-sm font-semibold text-foreground">{vs.saturacionOxigeno}%</p>
                                  <p className="text-xs text-muted-foreground">SpO2</p>
                                </div>
                              )}
                              {vs.glucosa && (
                                <div className="text-center p-2 bg-amber-50 rounded">
                                  <p className="text-sm font-semibold text-foreground">{vs.glucosa} mg/dL</p>
                                  <p className="text-xs text-muted-foreground">Glucosa</p>
                                </div>
                              )}
                            </div>
                            
                            {vs.notas && (
                              <p className="mt-3 text-sm text-muted-foreground italic">{vs.notas}</p>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Antecedentes */}
          {medicalSubTab === "antecedentes" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Antecedentes Personales */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-indigo-600" />
                      Antecedentes Personales
                    </CardTitle>
                    <CardDescription>Historial médico del paciente</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </CardHeader>
                <CardContent>
                  {personalHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Sin antecedentes personales registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {personalHistory.map((h) => (
                        <div key={h.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              h.categoria === "enfermedad" ? "bg-red-100" :
                              h.categoria === "cirugia" ? "bg-purple-100" :
                              h.categoria === "hospitalizacion" ? "bg-blue-100" : "bg-gray-100"
                            }`}>
                              {h.categoria === "enfermedad" && <Activity className="w-4 h-4 text-red-600" />}
                              {h.categoria === "cirugia" && <Scissors className="w-4 h-4 text-purple-600" />}
                              {h.categoria === "hospitalizacion" && <Building2 className="w-4 h-4 text-blue-600" />}
                              {h.categoria === "otro" && <FileText className="w-4 h-4 text-gray-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-foreground">{h.descripcion}</p>
                                <Badge variant="outline" className="text-xs capitalize">{h.categoria}</Badge>
                              </div>
                              {h.fecha && (
                                <p className="text-sm text-muted-foreground">
                                  {new Date(h.fecha).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
                                </p>
                              )}
                              {h.notas && (
                                <p className="text-sm text-muted-foreground mt-1">{h.notas}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Antecedentes Familiares */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-600" />
                      Antecedentes Familiares
                    </CardTitle>
                    <CardDescription>Historial médico familiar</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </CardHeader>
                <CardContent>
                  {familyHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Sin antecedentes familiares registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {familyHistory.map((h) => (
                        <div key={h.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-foreground">{h.descripcion}</p>
                                {h.parentesco && (
                                  <Badge variant="secondary" className="text-xs">{h.parentesco}</Badge>
                                )}
                              </div>
                              {h.notas && (
                                <p className="text-sm text-muted-foreground mt-1">{h.notas}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vacunas */}
          {medicalSubTab === "vacunas" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Syringe className="w-5 h-5 text-green-600" />
                    Cartilla de Vacunación
                  </CardTitle>
                  <CardDescription>{vaccines.length} vacunas registradas</CardDescription>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Vacuna
                </Button>
              </CardHeader>
              <CardContent>
                {vaccines.length === 0 ? (
                  <div className="text-center py-8">
                    <Syringe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Sin vacunas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vaccines
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((v) => (
                        <div key={v.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Syringe className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-foreground">{v.nombre}</p>
                                <Badge className="bg-green-100 text-green-700">Aplicada</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Fecha</p>
                                  <p className="text-sm text-foreground">
                                    {new Date(v.fecha).toLocaleDateString("es-MX")}
                                  </p>
                                </div>
                                {v.dosis && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Dosis</p>
                                    <p className="text-sm text-foreground">{v.dosis}</p>
                                  </div>
                                )}
                                {v.lote && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Lote</p>
                                    <p className="text-sm text-foreground">{v.lote}</p>
                                  </div>
                                )}
                                {v.aplicadoPor && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Aplicado por</p>
                                    <p className="text-sm text-foreground">{v.aplicadoPor}</p>
                                  </div>
                                )}
                              </div>
                              {v.proximaDosis && (
                                <div className="mt-2 p-2 bg-amber-50 rounded text-sm">
                                  <span className="text-amber-700">Próxima dosis: </span>
                                  <span className="text-amber-900 font-medium">
                                    {new Date(v.proximaDosis).toLocaleDateString("es-MX")}
                                  </span>
                                </div>
                              )}
                              {v.notas && (
                                <p className="text-sm text-muted-foreground mt-2 italic">{v.notas}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notas de Consulta */}
          {medicalSubTab === "notas" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notas de Consulta</CardTitle>
                  <CardDescription>Diagnósticos y recetas</CardDescription>
                </div>
                <FileText className="w-5 h-5 text-amber-700" />
              </CardHeader>
              <CardContent>
                {consultationNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Sin notas de consulta</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultationNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{note.diagnostico}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(note.fecha).toLocaleDateString("es-MX")}
                          </span>
                        </div>
                        
                        {note.sintomas.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">SÍNTOMAS</p>
                            <div className="flex flex-wrap gap-1">
                              {note.sintomas.map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground">{note.observaciones}</p>
                        
                        {note.recetas.length > 0 && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-2">RECETAS</p>
                            <div className="space-y-2">
                              {note.recetas.map((receta) => (
                                <div key={receta.id} className="p-2 bg-muted rounded">
                                  <p className="font-medium text-foreground text-sm">{receta.medicamento}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {receta.dosis} - {receta.frecuencia} por {receta.duracion}
                                  </p>
                                  {receta.instrucciones && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">{receta.instrucciones}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Archivos Adjuntos */}
          {medicalSubTab === "archivos" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Archivos Adjuntos</CardTitle>
                  <CardDescription>Labs, imágenes y documentos</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Subir Archivo
                </Button>
              </CardHeader>
              <CardContent>
                {attachments.length === 0 ? (
                  <div className="text-center py-8">
                    <Paperclip className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Sin archivos adjuntos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          att.tipo === "laboratorio" ? "bg-purple-100" :
                          att.tipo === "imagen" ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          {att.tipo === "laboratorio" ? (
                            <Activity className="w-5 h-5 text-purple-600" />
                          ) : att.tipo === "imagen" ? (
                            <FileText className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{att.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {att.descripcion || att.tipo} · {new Date(att.fecha).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">{att.tipo}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comunicaciones Tab */}
        <TabsContent value="comunicaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversaciones de WhatsApp</CardTitle>
              <CardDescription>
                Historial de comunicaciones con el paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Sin conversaciones registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-teal-600" />
                          <span className="font-medium text-foreground">Conversación</span>
                        </div>
                        <Badge variant={conv.estado === "activa" ? "default" : "secondary"}>
                          {conv.estado === "activa" ? "Activa" : conv.estado === "pendiente" ? "Pendiente" : "Resuelta"}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {conv.mensajes.slice(-5).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.tipo === "entrante" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.tipo === "entrante"
                                  ? "bg-muted"
                                  : msg.tipo === "bot"
                                    ? "bg-teal-100 text-teal-900"
                                    : "bg-blue-100 text-blue-900"
                              }`}
                            >
                              <p className="text-sm">{msg.contenido}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString("es-MX", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {msg.tipo === "bot" && " · Bot"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
