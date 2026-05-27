"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Building2,
  Bell,
  ShieldCheck,
} from "lucide-react"

const slides = [
  {
    icon: Stethoscope,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    title: "Bienvenido a MedConnect",
    subtitle: "La plataforma integral para gestión médica moderna",
    features: [
      { icon: Calendar, label: "Calendario de citas", desc: "Vista diaria, semanal y mensual" },
      { icon: Users, label: "Gestión de pacientes", desc: "Historial clínico centralizado" },
      { icon: Building2, label: "Multi-clínica", desc: "Administra varias clínicas desde un solo lugar" },
      { icon: Bell, label: "Notificaciones", desc: "Recibe alertas de citas y seguimientos" },
    ],
  },
  {
    icon: Calendar,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Gestión Clínica Completa",
    subtitle: "Todo lo que necesitas para operar tu consulta eficientemente",
    features: [
      { icon: Calendar, label: "Agenda inteligente", desc: "Evita conflictos de horario automáticamente" },
      { icon: Users, label: "Expedientes digitales", desc: "Notas, diagnósticos y signos vitales" },
      { icon: ShieldCheck, label: "Aislamiento de datos", desc: "Cada clínica ve solo sus propios pacientes" },
      { icon: Building2, label: "Dashboard por clínica", desc: "Métricas y actividad en tiempo real" },
    ],
  },
  {
    icon: MessageSquare,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Bot de WhatsApp con IA",
    subtitle: "Tus pacientes agendan citas 24/7 sin que levantes el teléfono",
    features: [
      { icon: MessageSquare, label: "Agendamiento automático", desc: "El bot entiende lenguaje natural en español" },
      { icon: Bell, label: "Recordatorios automáticos", desc: "Reduce el no-show enviando recordatorios" },
      { icon: Users, label: "Identificación de pacientes", desc: "Reconoce pacientes recurrentes" },
      { icon: Calendar, label: "Confirmación instantánea", desc: "Los pacientes reciben confirmación al instante" },
    ],
  },
  {
    icon: BarChart2,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    title: "Percentiles Pediátricos",
    subtitle: "Seguimiento de crecimiento basado en estándares OMS para pediatras",
    features: [
      { icon: BarChart2, label: "Curvas de crecimiento", desc: "Peso, talla y perímetro cefálico vs OMS" },
      { icon: Users, label: "Por paciente", desc: "Historial de mediciones en el tiempo" },
      { icon: ShieldCheck, label: "Rangos normales", desc: "Alertas automáticas fuera de P3–P97" },
      { icon: Stethoscope, label: "Solo para pediatras", desc: "Visible únicamente en perfiles de Pediatría" },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const isLast = current === slides.length - 1
  const slide = slides[current]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <div
          className="h-full bg-teal-600 transition-all duration-500"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 ${slide.iconBg} rounded-2xl flex items-center justify-center mx-auto`}>
                <Icon className={`w-8 h-8 ${slide.iconColor}`} />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{slide.title}</h1>
              <p className="text-muted-foreground">{slide.subtitle}</p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slide.features.map((f) => {
                const FIcon = f.icon
                return (
                  <div
                    key={f.label}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-2 bg-background rounded-lg border border-border shrink-0">
                      <FIcon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => current > 0 ? setCurrent(current - 1) : router.push("/auth/login")}
                className="text-muted-foreground"
              >
                {current > 0 ? (
                  <><ChevronLeft className="w-4 h-4 mr-1" />Atrás</>
                ) : (
                  "Omitir"
                )}
              </Button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-5 h-2 bg-teal-600"
                        : "w-2 h-2 bg-border hover:bg-teal-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={() => isLast ? router.push("/auth/login") : setCurrent(current + 1)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isLast ? "Iniciar Sesión" : "Siguiente"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
