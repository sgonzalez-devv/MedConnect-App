"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, MessageSquare, Settings, ChevronRight, ChevronLeft, Check } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Bienvenido a MedConnect",
    description: "El sistema integral para gestión de citas médicas",
  },
  {
    id: 2,
    title: "Información del Consultorio",
    description: "Configura los datos básicos de tu práctica médica",
  },
  {
    id: 3,
    title: "Horarios de Atención",
    description: "Define tus horarios de disponibilidad",
  },
  {
    id: 4,
    title: "¡Todo Listo!",
    description: "Tu cuenta está configurada",
  },
]

const features = [
  {
    icon: Calendar,
    title: "Calendario Inteligente",
    description: "Gestiona tus citas de forma eficiente con vista diaria, semanal y mensual",
  },
  {
    icon: Users,
    title: "Gestión de Pacientes",
    description: "Mantén un registro completo del historial médico de cada paciente",
  },
  {
    icon: MessageSquare,
    title: "Bot de WhatsApp",
    description: "Automatiza la programación de citas con inteligencia artificial",
  },
  {
    icon: Settings,
    title: "Configuración Flexible",
    description: "Personaliza el sistema según las necesidades de tu consultorio",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    nombreConsultorio: "",
    especialidad: "",
    direccion: "",
    telefono: "",
    horarioInicio: "09:00",
    horarioFin: "18:00",
    duracionCita: "30",
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/auth/login")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <div
          className="h-full bg-teal-600 transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-border shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-2xl font-bold">M</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <feature.icon className="w-8 h-8 text-teal-600 mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreConsultorio">Nombre del Consultorio</Label>
                  <Input
                    id="nombreConsultorio"
                    placeholder="Ej: Centro Médico Pérez"
                    value={formData.nombreConsultorio}
                    onChange={(e) => setFormData({ ...formData, nombreConsultorio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Select
                    value={formData.especialidad}
                    onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Medicina General</SelectItem>
                      <SelectItem value="pediatria">Pediatría</SelectItem>
                      <SelectItem value="ginecologia">Ginecología</SelectItem>
                      <SelectItem value="cardiologia">Cardiología</SelectItem>
                      <SelectItem value="dermatologia">Dermatología</SelectItem>
                      <SelectItem value="oftalmologia">Oftalmología</SelectItem>
                      <SelectItem value="traumatologia">Traumatología</SelectItem>
                      <SelectItem value="psiquiatria">Psiquiatría</SelectItem>
                      <SelectItem value="otra">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle, número, sector, ciudad"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono de Contacto</Label>
                  <Input
                    id="telefono"
                    placeholder="+1 809 555 1234"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horarioInicio">Hora de Inicio</Label>
                    <Select
                      value={formData.horarioInicio}
                      onValueChange={(value) => setFormData({ ...formData, horarioInicio: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (7 + i).toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horarioFin">Hora de Cierre</Label>
                    <Select
                      value={formData.horarioFin}
                      onValueChange={(value) => setFormData({ ...formData, horarioFin: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (12 + i).toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracionCita">Duración de Cita por Defecto</Label>
                  <Select
                    value={formData.duracionCita}
                    onValueChange={(value) => setFormData({ ...formData, duracionCita: value })}
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
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Días Laborales</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          index < 5
                            ? "bg-teal-600 text-white"
                            : "bg-card border border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-teal-600" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-4">
                    Tu consultorio está listo para comenzar. Inicia sesión con tus credenciales de administrador para acceder al panel de control.
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Consultorio:</span>{" "}
                      <span className="text-muted-foreground">{formData.nombreConsultorio || "No especificado"}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Horario:</span>{" "}
                      <span className="text-muted-foreground">{formData.horarioInicio} - {formData.horarioFin}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Duración de cita:</span>{" "}
                      <span className="text-muted-foreground">{formData.duracionCita} minutos</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <div>
                {currentStep > 1 ? (
                  <Button variant="ghost" onClick={handleBack}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Atrás
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handleSkip}>
                    Omitir
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step.id === currentStep
                        ? "bg-teal-600"
                        : step.id < currentStep
                          ? "bg-teal-300"
                          : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700 text-white">
                {currentStep === steps.length ? "Ir al Login" : "Siguiente"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
