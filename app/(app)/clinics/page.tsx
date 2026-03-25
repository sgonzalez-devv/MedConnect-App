"use client"

import Link from "next/link"
import { useClinicContext } from "@/hooks/use-clinic-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react"

export default function ClinicListPage() {
  const { clinics, currentClinic } = useClinicContext()

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Selecciona una Clínica</h1>
        <p className="text-muted-foreground">Elige una clínica para continuar</p>
      </div>

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
                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
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
    </div>
  )
}
