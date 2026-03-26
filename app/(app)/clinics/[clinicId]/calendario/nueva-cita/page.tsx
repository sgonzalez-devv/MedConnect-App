"use client"

import { useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Clock, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { getClinicPatients, clinics } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClinicColors } from "@/lib/theme-utils"

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
]

export default function ClinicNewAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const clinicId = params.clinicId as string
  const clinic = clinics.find((c) => c.id === clinicId)
  const preSelectedPatientId = searchParams.get("paciente") || ""

  const [mode, setMode] = useState<"manual" | "bot">("manual")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    pacienteId: preSelectedPatientId,
    hora: "",
    duracion: "30",
    tipo: "consulta",
    motivo: "",
    notas: "",
  })

  if (!clinic) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Clínica no encontrada</p>
        </div>
      </div>
    )
  }

  const clinicColors = getClinicColors(clinic.colorPalette.presetName)
  const clinicPatients = getClinicPatients(clinicId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/clinics/${clinicId}/calendario`)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/clinics/${clinicId}/calendario`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className={`border-l-4 pl-4 ${clinicColors.borderL} flex-1`}>
          <h1 className="text-2xl font-bold text-foreground">Nueva Cita - {clinic.name}</h1>
          <p className="text-muted-foreground">Programa una nueva cita médica</p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "manual" | "bot")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Asistido por Bot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Agendar Cita Manual</CardTitle>
              <CardDescription>
                Completa los datos para programar la cita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="paciente">Paciente</Label>
                  <Select
                    value={formData.pacienteId}
                    onValueChange={(v) => setFormData({ ...formData, pacienteId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinicPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.nombre} {patient.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            date.toLocaleDateString("es-DO", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Select
                      value={formData.hora}
                      onValueChange={(v) => setFormData({ ...formData, hora: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {time}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Type and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Cita</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="seguimiento">Seguimiento</SelectItem>
                        <SelectItem value="revision">Revisión</SelectItem>
                        <SelectItem value="urgencia">Urgencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duración</Label>
                    <Select
                      value={formData.duracion}
                      onValueChange={(v) => setFormData({ ...formData, duracion: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la Consulta</Label>
                  <Input
                    id="motivo"
                    placeholder="Ej: Control de presión arterial"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  />
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notas">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="notas"
                    placeholder="Información adicional sobre la cita..."
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" asChild>
                    <Link href={`/clinics/${clinicId}/calendario`}>Cancelar</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Agendar Cita"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot">
          <Card>
            <CardHeader>
              <CardTitle>Cita Asistida por Bot</CardTitle>
              <CardDescription>
                El bot de WhatsApp ayudará al paciente a agendar su cita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className={`w-16 h-16 ${clinicColors.bg} rounded-full flex items-center justify-center mx-auto mb-4 border border-opacity-20`}>
                  <Bot className={`w-8 h-8 ${clinicColors.text}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Bot de WhatsApp Activo
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Los pacientes pueden enviar un mensaje al número de WhatsApp de {clinic.name}
                  para agendar citas automáticamente. El bot les guiará en el proceso.
                </p>
                <div className="bg-muted p-4 rounded-lg inline-block">
                  <p className="text-sm text-muted-foreground mb-1">Número de WhatsApp</p>
                  <p className="text-lg font-mono font-medium text-foreground">
                    {clinic.telefono}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
