"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calendar,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react"
import {
  clinics,
  getClinicPatients,
  getClinicTodayAppointments,
} from "@/lib/mock-data"
import { getClinicColors } from "@/lib/theme-utils"

export default function MultiClinicDashboard() {
  const clinicStats = clinics.map((clinic) => {
    const patients = getClinicPatients(clinic.id)
    const todayAppointments = getClinicTodayAppointments(clinic.id)
    const colors = getClinicColors(clinic.colorPalette.presetName)

    return {
      clinic,
      patientCount: patients.length,
      todayCount: todayAppointments.length,
      confirmedCount: todayAppointments.filter((a) => a.estado === "confirmada").length,
      colors,
    }
  })

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Multi-Clínica</h1>
            <p className="text-muted-foreground">
              Resumen agregado de todas tus clínicas
            </p>
          </div>
        </div>

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clinicStats.map(({ clinic, patientCount, todayCount, confirmedCount, colors }) => (
            <Link
              key={clinic.id}
              href={`/clinics/${clinic.id}/dashboard`}
              className="group"
            >
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${colors.borderL} ${colors.bg}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                          <Building2 className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <CardTitle className={colors.text}>{clinic.name}</CardTitle>
                      </div>
                      <CardDescription className={colors.text + " opacity-75"}>
                        {clinic.location}
                      </CardDescription>
                    </div>
                    <Badge className={colors.badge}>
                      Activa
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Patients */}
                    <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Pacientes</p>
                          <p className={`text-2xl font-bold ${colors.text}`}>{patientCount}</p>
                        </div>
                        <Users className={`w-4 h-4 ${colors.text} opacity-50`} />
                      </div>
                    </div>

                    {/* Today's Appointments */}
                    <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Citas Hoy</p>
                          <p className={`text-2xl font-bold ${colors.text}`}>{todayCount}</p>
                        </div>
                        <Calendar className={`w-4 h-4 ${colors.text} opacity-50`} />
                      </div>
                    </div>
                  </div>

                  {/* Confirmed Count */}
                  <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Confirmadas Hoy</p>
                        <p className={`text-lg font-semibold ${colors.text}`}>
                          {confirmedCount} de {todayCount}
                        </p>
                      </div>
                      <TrendingUp className={`w-4 h-4 ${colors.text} opacity-50`} />
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    className={`w-full ${colors.borderL}`}
                    variant="outline"
                  >
                    Ver Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
