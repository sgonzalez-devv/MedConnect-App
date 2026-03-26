"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  MessageCircle, 
  Calendar, 
  Bell, 
  Clock, 
  Users, 
  Bot,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { clinics } from "@/lib/mock-data"
import { getClinicColors } from "@/lib/theme-utils"
import { getClinicConversationsWithPatients } from "@/lib/mock-data"

const onboardingSteps = [
  {
    id: 1,
    icon: MessageCircle,
    title: "Respuestas Automáticas 24/7",
    description: "Tu bot de WhatsApp responderá a los pacientes en cualquier momento del día o la noche, incluso cuando no estés disponible.",
    benefits: [
      "Atención inmediata sin esperas",
      "Disponible fines de semana y feriados",
      "Respuestas consistentes y profesionales"
    ],
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 2,
    icon: Calendar,
    title: "Agendamiento Inteligente",
    description: "Los pacientes podrán agendar, modificar o cancelar sus citas directamente desde WhatsApp sin necesidad de llamadas.",
    benefits: [
      "Reducción de llamadas telefónicas",
      "Menos citas perdidas o no confirmadas",
      "Sincronización automática con tu calendario"
    ],
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: 3,
    icon: Bell,
    title: "Recordatorios Automáticos",
    description: "El bot enviará recordatorios de citas a tus pacientes para reducir las ausencias y mejorar la puntualidad.",
    benefits: [
      "Recordatorio 24 horas antes",
      "Confirmación de asistencia automática",
      "Reduce las citas perdidas hasta un 40%"
    ],
    color: "from-amber-500 to-orange-600"
  },
  {
    id: 4,
    icon: Users,
    title: "Gestión de Pacientes",
    description: "Mantén un registro actualizado de las conversaciones y preferencias de cada paciente para una atención más personalizada.",
    benefits: [
      "Historial de conversaciones completo",
      "Notas y preferencias del paciente",
      "Comunicación más efectiva"
    ],
    color: "from-purple-500 to-violet-600"
  },
  {
    id: 5,
    icon: Clock,
    title: "Ahorra Tiempo Valioso",
    description: "Dedica más tiempo a tus pacientes y menos a tareas administrativas. El bot se encarga del resto.",
    benefits: [
      "Hasta 2 horas diarias ahorradas",
      "Menos interrupciones durante consultas",
      "Enfócate en lo que realmente importa"
    ],
    color: "from-teal-500 to-cyan-600"
  }
]

export default function ClinicBotWhatsAppPage() {
  const params = useParams()
  const clinicId = params.clinicId as string
  const clinic = clinics.find((c) => c.id === clinicId)
  
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

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
  const clinicConversations = getClinicConversationsWithPatients(clinicId)

  useEffect(() => {
    // Check if onboarding was already shown this session
    const onboardingShown = sessionStorage.getItem(`whatsapp-onboarding-shown-${clinicId}`)
    if (onboardingShown) {
      setShowOnboarding(false)
    }
  }, [clinicId])

  const handleNextStep = () => {
    if (isAnimating) return
    setIsAnimating(true)
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finish onboarding
      sessionStorage.setItem(`whatsapp-onboarding-shown-${clinicId}`, "true")
      setShowOnboarding(false)
    }
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handlePrevStep = () => {
    if (isAnimating || currentStep === 0) return
    setIsAnimating(true)
    setCurrentStep(currentStep - 1)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleSkipOnboarding = () => {
    sessionStorage.setItem(`whatsapp-onboarding-shown-${clinicId}`, "true")
    setShowOnboarding(false)
  }

  const currentStepData = onboardingSteps[currentStep]
  const StepIcon = currentStepData.icon

  if (showOnboarding) {
    return (
      <TooltipProvider>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 md:p-6">
          <div className="w-full max-w-2xl">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {onboardingSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => !isAnimating && setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep 
                      ? "w-8 bg-green-600" 
                      : idx < currentStep 
                        ? "w-2 bg-green-400" 
                        : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Main card */}
            <Card className={`overflow-hidden shadow-xl border-0 transition-all duration-300 ${isAnimating ? "opacity-80 scale-98" : "opacity-100 scale-100"}`}>
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${currentStepData.color} p-8 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                    <StepIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{currentStepData.title}</h2>
                  <p className="text-white/90 text-base md:text-lg leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <CardContent className="p-6 md:p-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Beneficios principales
                </h3>
                <ul className="space-y-3">
                  {currentStepData.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div>
                    {currentStep > 0 ? (
                      <Button 
                        variant="ghost" 
                        onClick={handlePrevStep}
                        disabled={isAnimating}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        onClick={handleSkipOnboarding}
                        className="text-muted-foreground"
                      >
                        Saltar
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {currentStep + 1} de {onboardingSteps.length}
                    </span>
                    <Button 
                      onClick={handleNextStep}
                      disabled={isAnimating}
                      className={`gap-2 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 transition-opacity`}
                    >
                      {currentStep === onboardingSteps.length - 1 ? (
                        <>
                          Comenzar
                          <Sparkles className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Siguiente
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Main page after onboarding
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className={`border-l-4 pl-4 ${clinicColors.borderL}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Bot de WhatsApp - {clinic.name}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {clinicConversations.length} conversaciones activas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Features grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[
              { icon: MessageCircle, label: "Chat 24/7", color: "text-green-600 bg-green-50" },
              { icon: Calendar, label: "Citas", color: "text-blue-600 bg-blue-50" },
              { icon: Bell, label: "Recordatorios", color: "text-amber-600 bg-amber-50" },
              { icon: Clock, label: "Ahorra tiempo", color: "text-teal-600 bg-teal-50" },
            ].map((feature, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div className={`p-4 rounded-xl ${feature.color.split(' ')[1]} border border-transparent hover:border-gray-200 transition-all duration-200 cursor-default`}>
                    <feature.icon className={`h-6 w-6 mx-auto mb-2 ${feature.color.split(' ')[0]}`} />
                    <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Funcionalidad disponible con la integración
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Stats Card */}
          <Card className="card-hover">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Estado del Bot</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{clinicConversations.length}</p>
                  <p className="text-sm text-muted-foreground">Conversaciones activas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{clinicConversations.filter(c => c.estado === 'resuelta').length}</p>
                  <p className="text-sm text-muted-foreground">Conversaciones resueltas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Card className={`bg-gradient-to-r ${clinicColors.bg} border-l-4 ${clinicColors.borderL}`}>
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Integrar WhatsApp con MedConnect</h3>
              <p className="text-muted-foreground">
                Conecta tu número de WhatsApp Business para comenzar a automatizar la comunicación con tus pacientes
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 gap-3 group whitespace-nowrap"
                >
                  <MessageCircle className="h-5 w-5" />
                  Integrar
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Requiere una cuenta de WhatsApp Business
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
