"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupMetrics } from "@/lib/types"

interface TrendChartProps {
  metrics: GroupMetrics
  groupId: string
}

export function TrendChart({ metrics, groupId }: TrendChartProps) {
  // Mock trend data for last 6 months
  const trendData = [
    { month: "Ene", "clinic-001": 10, "clinic-002": 8 },
    { month: "Feb", "clinic-001": 12, "clinic-002": 9 },
    { month: "Mar", "clinic-001": 15, "clinic-002": 12 },
    { month: "Abr", "clinic-001": 18, "clinic-002": 14 },
    { month: "May", "clinic-001": 22, "clinic-002": 17 },
    { month: "Jun", "clinic-001": 25, "clinic-002": 20 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Citas</CardTitle>
        <CardDescription>Trends de citas en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="clinic-001"
                stroke="#0d9488"
                name="Clínica Central"
              />
              <Line type="monotone" dataKey="clinic-002" stroke="#0ea5e9" name="Clínica Naco" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
