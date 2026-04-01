"use client"

import Link from "next/link"
import { useClinicContext } from "@/hooks/use-clinic-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight, CheckCircle2, Plus } from "lucide-react"

export default function ClinicListPage() {
  const { clinics, currentClinic } = useClinicContext()

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Clínicas</h1>
          <p className="text-muted-foreground">
            {clinics.length > 0 ? "Selecciona una clínica para continuar" : "Registra tu primera clínica para empezar"}
          </p>
        </div>
        <Button asChild>
          <Link href="/clinics/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Clínica
          </Link>
        </Button>
      </div>

      {clinics.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-5">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-teal-500" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold">No hay clínicas registradas</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Crea tu primera clínica para comenzar a gestionar pacientes y citas.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/clinics/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Crear primera clínica
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ── Clinic list ─────────────────────────────────────────────────── */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <Card
              key={clinic.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                currentClinic?.id === clinic.id ? "ring-2 ring-teal-500" : ""
              }`}
            >
              {currentClinic?.id === clinic.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: clinic.colorPalette.customSecondaryHex || "oklch(0.70 0.19 163)",
                    }}
                  >
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{clinic.name}</CardTitle>
                    <CardDescription>{clinic.location}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-foreground">{clinic.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">{clinic.telefono}</p>
                  </div>
                </div>
                <Link
                  href={`/clinics/${clinic.id}/dashboard`}
                  className="block"
                >
                  <Button
                    className="w-full gap-2"
                    variant={currentClinic?.id === clinic.id ? "default" : "outline"}
                  >
                    {currentClinic?.id === clinic.id ? "En esta clínica" : "Ir al Dashboard"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
