"use client"

import { getGroupMetrics, clinicGroups, clinics } from "@/lib/mock-data"
import { ComparativeChart } from "@/components/group-analytics/comparative-chart"
import { TrendChart } from "@/components/group-analytics/trend-chart"
import { GrowthRateCard } from "@/components/group-analytics/growth-rate-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface GroupDashboardProps {
  params: { groupId: string }
}

export default function GroupDashboard({ params }: GroupDashboardProps) {
  const group = clinicGroups.find((g) => g.id === params.groupId)

  if (!group) {
    return (
      <div className="p-4 md:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Grupo no encontrado</p>
              <p className="text-sm text-red-700">
                El grupo con ID {params.groupId} no existe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = getGroupMetrics(params.groupId)
  const clinicNames = group.clinicIds
    .map((id) => clinics.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard - {group.name}</h1>
          <p className="text-muted-foreground">
            {group.clinicIds.length} clínicas: {clinicNames}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">En todas las clínicas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Citas Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Historial completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Citas Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.appointmentsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.completedAppointmentsThisMonth} completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <GrowthRateCard metrics={metrics} groupId={params.groupId} />
        <ComparativeChart metrics={metrics} groupId={params.groupId} />
        <TrendChart metrics={metrics} groupId={params.groupId} />
      </div>
    </div>
  )
}
