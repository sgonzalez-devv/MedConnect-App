"use client"

import { useState, useEffect } from "react"
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

export default function BotWhatsAppPage() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if onboarding was already shown this session
    const onboardingShown = sessionStorage.getItem("whatsapp-onboarding-shown")
    if (onboardingShown) {
      setShowOnboarding(false)
    }
  }, [])

  const handleNextStep = () => {
    if (isAnimating) return
    setIsAnimating(true)
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finish onboarding
      sessionStorage.setItem("whatsapp-onboarding-shown", "true")
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
    sessionStorage.setItem("whatsapp-onboarding-shown", "true")
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 md:p-6">
        <div className="w-full max-w-xl text-center">
          {/* Illustration */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center shadow-lg">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-inner">
                <Bot className="h-12 w-12 text-white" />
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-20 w-8 h-8 rounded-full bg-green-200 opacity-60 animate-pulse" />
            <div className="absolute bottom-4 left-1/2 translate-x-16 w-6 h-6 rounded-full bg-emerald-300 opacity-60 animate-pulse delay-300" />
            <div className="absolute top-8 left-1/2 translate-x-24 w-4 h-4 rounded-full bg-teal-200 opacity-60 animate-pulse delay-500" />
          </div>

          {/* Title and description */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bot de WhatsApp
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Automatiza la comunicación con tus pacientes y ahorra tiempo valioso con nuestro asistente inteligente.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

          {/* CTA Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6 h-auto gap-3 group"
              >
                <MessageCircle className="h-5 w-5" />
                Integrar WhatsApp con MedConnect
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>Conecta tu número de WhatsApp Business para comenzar a automatizar la comunicación con tus pacientes</p>
            </TooltipContent>
          </Tooltip>

          {/* Additional info */}
          <p className="text-sm text-muted-foreground mt-6">
            Requiere una cuenta de WhatsApp Business
          </p>

          {/* Reset onboarding link */}
          <button 
            onClick={() => {
              sessionStorage.removeItem("whatsapp-onboarding-shown")
              setShowOnboarding(true)
              setCurrentStep(0)
            }}
            className="text-sm text-teal-600 hover:text-teal-700 mt-4 underline-offset-2 hover:underline transition-colors"
          >
            Ver introducción nuevamente
          </button>
        </div>
      </div>
    </TooltipProvider>
  )
}
