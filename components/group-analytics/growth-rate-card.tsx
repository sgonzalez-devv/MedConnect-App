"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { GroupMetrics } from "@/lib/types"

interface GrowthRateCardProps {
  metrics: GroupMetrics
  groupId: string
}

export function GrowthRateCard({ metrics, groupId }: GrowthRateCardProps) {
  // Calculate completion rate based on metrics
  const completionRate =
    metrics.completedAppointmentsThisMonth > 0
      ? (
          (metrics.completedAppointmentsThisMonth / metrics.appointmentsThisMonth) *
          100
        ).toFixed(1)
      : "0.0"

  return (
    <Card className="bg-gradient-to-br from-green-50 to-teal-50">
      <CardHeader>
        <CardTitle>Tasa de Finalización de Citas</CardTitle>
        <CardDescription>Porcentaje de citas completadas este mes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-green-700">{completionRate}%</div>
            <p className="text-sm text-green-600 mt-2">
              {metrics.completedAppointmentsThisMonth} de {metrics.appointmentsThisMonth} citas
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-600" />
        </div>
      </CardContent>
    </Card>
  )
}
