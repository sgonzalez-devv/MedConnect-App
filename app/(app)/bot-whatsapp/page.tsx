"use client"

import { Bot, Construction } from "lucide-react"

export default function BotWhatsAppPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 md:p-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="relative mb-8 inline-block">
          <div className="w-32 h-32 mx-auto rounded-full bg-amber-100 flex items-center justify-center shadow-lg">
            <Bot className="h-14 w-14 text-amber-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Construction className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          En Construcción
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Bot de WhatsApp
        </h1>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-6">
          Estamos trabajando en la integración del bot de WhatsApp para automatizar la comunicación con tus pacientes. Esta funcionalidad estará disponible muy pronto.
        </p>

        {/* Features coming soon */}
        <div className="bg-muted/50 rounded-xl p-5 text-left space-y-3 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Próximas funcionalidades
          </p>
          {[
            "Respuestas automáticas 24/7",
            "Agendamiento de citas por WhatsApp",
            "Recordatorios automáticos a pacientes",
            "Gestión de conversaciones centralizada",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}