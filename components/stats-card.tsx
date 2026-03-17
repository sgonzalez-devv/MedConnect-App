import { Card, CardContent } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "teal" | "blue" | "indigo" | "orange" | "gray"
}

const colorClasses = {
  teal: "bg-teal-50 text-teal-600",
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  orange: "bg-orange-50 text-orange-600",
  gray: "bg-gray-100 text-gray-600"
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "teal" }: StatsCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}% vs ayer
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
