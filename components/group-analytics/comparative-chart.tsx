"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupMetrics } from "@/lib/types"

interface ComparativeChartProps {
  metrics: GroupMetrics
  groupId: string
}

export function ComparativeChart({ metrics, groupId }: ComparativeChartProps) {
  const data = Object.entries(metrics.appointmentsByClinic).map(([clinicId, count]) => ({
    clinicId,
    count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Clínica</CardTitle>
        <CardDescription>Comparativa de citas por clínica en el grupo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clinicId" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="var(--clinic-primary, #0d9488)" name="Citas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
