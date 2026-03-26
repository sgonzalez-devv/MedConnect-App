"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { User, Clock, Bell, Shield, Save, Camera } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { clinics } from "@/lib/mock-data"
import { getClinicColors } from "@/lib/theme-utils"

export default function ClinicConfiguracionPage() {
  const params = useParams()
  const clinicId = params.clinicId as string
  const clinic = clinics.find((c) => c.id === clinicId)

  const [profileData, setProfileData] = useState({
    nombre: clinic?.name || "Clínica",
    email: clinic?.email || "",
    telefono: clinic?.telefono || "",
    direccion: clinic?.location || "",
  })

  const [horarioData, setHorarioData] = useState({
    inicioManana: "08:00",
    finManana: "14:00",
    inicioTarde: "16:00",
    finTarde: "20:00",
    duracionCita: "30",
    diasLaborales: ["lunes", "martes", "miercoles", "jueves", "viernes"]
  })

  const [notificaciones, setNotificaciones] = useState({
    emailCitas: true,
    emailCancelaciones: true,
    whatsappRecordatorios: true,
    whatsappConfirmaciones: true,
    pushNuevasCitas: true,
    pushMensajes: false
  })

  if (!clinic) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Clínica no encontrada</p>
        </div>
      </div>
    )
  }

  const clinicColors = getClinicColors(clinic.colorPalette.presetName)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className={`border-l-4 pl-4 ${clinicColors.borderL}`}>
        <h1 className="text-2xl font-bold text-foreground">Configuración - {clinic.name}</h1>
        <p className="text-muted-foreground">Gestiona la configuración y preferencias de la clínica</p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Clínica</span>
          </TabsTrigger>
          <TabsTrigger value="horario" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horario</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Clínica Tab */}
        <TabsContent value="perfil" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Clínica</CardTitle>
              <CardDescription>Actualiza la información y detalles de la clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la clínica</Label>
                  <Input 
                    id="nombre" 
                    value={profileData.nombre}
                    onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    type="tel"
                    value={profileData.telefono}
                    onChange={(e) => setProfileData({...profileData, telefono: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input 
                    id="direccion"
                    value={profileData.direccion}
                    onChange={(e) => setProfileData({...profileData, direccion: e.target.value})}
                  />
                </div>
              </div>
              <Button className="btn-primary gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Horario Tab */}
        <TabsContent value="horario" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Horario de Atención</CardTitle>
              <CardDescription>Configura los horarios de trabajo de la clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Horario de Mañana</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inicioManana">Inicio</Label>
                    <Input 
                      id="inicioManana" 
                      type="time"
                      value={horarioData.inicioManana}
                      onChange={(e) => setHorarioData({...horarioData, inicioManana: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finManana">Fin</Label>
                    <Input 
                      id="finManana" 
                      type="time"
                      value={horarioData.finManana}
                      onChange={(e) => setHorarioData({...horarioData, finManana: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Horario de Tarde</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inicioTarde">Inicio</Label>
                    <Input 
                      id="inicioTarde" 
                      type="time"
                      value={horarioData.inicioTarde}
                      onChange={(e) => setHorarioData({...horarioData, inicioTarde: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finTarde">Fin</Label>
                    <Input 
                      id="finTarde" 
                      type="time"
                      value={horarioData.finTarde}
                      onChange={(e) => setHorarioData({...horarioData, finTarde: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duracionCita">Duración de cita por defecto (minutos)</Label>
                  <Input 
                    id="duracionCita" 
                    type="number"
                    value={horarioData.duracionCita}
                    onChange={(e) => setHorarioData({...horarioData, duracionCita: e.target.value})}
                  />
                </div>
              </div>

              <Button className="btn-primary gap-2">
                <Save className="h-4 w-4" />
                Guardar Horario
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones Tab */}
        <TabsContent value="notificaciones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Controla qué notificaciones deseas recibir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailCitas" className="text-base">Email para nuevas citas</Label>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones por email de nuevas citas</p>
                  </div>
                  <Switch 
                    id="emailCitas"
                    checked={notificaciones.emailCitas}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, emailCitas: checked})}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailCancelaciones" className="text-base">Email para cancelaciones</Label>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones de cancelaciones</p>
                  </div>
                  <Switch 
                    id="emailCancelaciones"
                    checked={notificaciones.emailCancelaciones}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, emailCancelaciones: checked})}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsappRecordatorios" className="text-base">Recordatorios por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Envía recordatorios a los pacientes por WhatsApp</p>
                  </div>
                  <Switch 
                    id="whatsappRecordatorios"
                    checked={notificaciones.whatsappRecordatorios}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, whatsappRecordatorios: checked})}
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsappConfirmaciones" className="text-base">Confirmaciones por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Solicita confirmación de citas por WhatsApp</p>
                  </div>
                  <Switch 
                    id="whatsappConfirmaciones"
                    checked={notificaciones.whatsappConfirmaciones}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, whatsappConfirmaciones: checked})}
                  />
                </div>
              </div>

              <Button className="btn-primary gap-2">
                <Save className="h-4 w-4" />
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema Tab */}
        <TabsContent value="sistema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Configuración avanzada y seguridad de la clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autenticacion" className="text-base">Autenticación de dos factores</Label>
                  <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                </div>
                <Switch id="autenticacion" defaultChecked={false} />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="respaldos" className="text-base">Respaldos automáticos</Label>
                  <p className="text-sm text-muted-foreground">Realiza respaldos automáticos de tus datos</p>
                </div>
                <Switch id="respaldos" defaultChecked={true} />
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="zona-horaria">Zona horaria</Label>
                <Select defaultValue="america-santo-domingo">
                  <SelectTrigger id="zona-horaria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-santo-domingo">America/Santo_Domingo (AST)</SelectItem>
                    <SelectItem value="america-new-york">America/New_York (EST/EDT)</SelectItem>
                    <SelectItem value="america-toronto">America/Toronto (EST/EDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-primary gap-2">
                <Save className="h-4 w-4" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
