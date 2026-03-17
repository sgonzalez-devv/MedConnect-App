"use client"

import { Bell, Calendar, MessageCircle, Clock, Info, Check } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { notifications, getUnreadNotificationsCount } from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/date-utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cita: Calendar,
  mensaje: MessageCircle,
  recordatorio: Clock,
  sistema: Info
}

const colorMap: Record<string, string> = {
  cita: "text-blue-600 bg-blue-50",
  mensaje: "text-green-600 bg-green-50",
  recordatorio: "text-amber-600 bg-amber-50",
  sistema: "text-gray-600 bg-gray-50"
}

export function NotificationPanel() {
  const unreadCount = getUnreadNotificationsCount()

  return (
    <TooltipProvider>
      <Sheet>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-amber-50 transition-colors duration-200">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 text-white text-xs animate-pulse"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : "Sin notificaciones nuevas"}
          </TooltipContent>
        </Tooltip>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Notificaciones
              </SheetTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-colors duration-200">
                    <Check className="h-4 w-4 mr-1" />
                    Marcar todas
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar todas las notificaciones como leídas</TooltipContent>
              </Tooltip>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-4">
            <div className="flex flex-col gap-2 pr-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No hay notificaciones</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = iconMap[notification.tipo] || Info
                  const colorClass = colorMap[notification.tipo] || colorMap.sistema
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        !notification.leida 
                          ? "bg-amber-50/70 border-amber-200 hover:bg-amber-50" 
                          : "bg-card border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${!notification.leida ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.titulo}
                            </p>
                            {!notification.leida && (
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 flex-shrink-0 mt-1 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.mensaje}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
