"use client"

import { useState } from "react"
import { User, Clock, Bell, Shield, Palette, Globe, Save, Camera } from "lucide-react"
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

export default function ConfiguracionPage() {
  const [profileData, setProfileData] = useState({
    nombre: "Dra. Carmen Altagracia Pérez",
    email: "carmen.perez@medconnect.com",
    telefono: "+1 809 555 1234",
    especialidad: "Medicina General",
    clinica: "Centro Médico Naco",
    direccion: "Av. Tiradentes #25, Naco, Santo Domingo"
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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y preferencias del sistema</p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
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

        {/* Perfil Tab */}
        <TabsContent value="perfil" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Tu foto se mostrará en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl bg-teal-100 text-teal-700">CP</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Cambiar foto
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información de contacto y profesional</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input 
                      id="nombre" 
                      value={profileData.nombre}
                      onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
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
                      value={profileData.telefono}
                      onChange={(e) => setProfileData({...profileData, telefono: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad</Label>
                    <Input 
                      id="especialidad" 
                      value={profileData.especialidad}
                      onChange={(e) => setProfileData({...profileData, especialidad: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinica">Clínica / Consultorio</Label>
                  <Input 
                    id="clinica" 
                    value={profileData.clinica}
                    onChange={(e) => setProfileData({...profileData, clinica: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea 
                    id="direccion" 
                    value={profileData.direccion}
                    onChange={(e) => setProfileData({...profileData, direccion: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Horario Tab */}
        <TabsContent value="horario" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Horario de Atención</CardTitle>
                <CardDescription>Define tu horario de consultas</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div>
                  <h4 className="font-medium mb-3">Turno Mañana</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inicioManana">Hora inicio</Label>
                      <Input 
                        id="inicioManana" 
                        type="time"
                        value={horarioData.inicioManana}
                        onChange={(e) => setHorarioData({...horarioData, inicioManana: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finManana">Hora fin</Label>
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
                  <h4 className="font-medium mb-3">Turno Tarde</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inicioTarde">Hora inicio</Label>
                      <Input 
                        id="inicioTarde" 
                        type="time"
                        value={horarioData.inicioTarde}
                        onChange={(e) => setHorarioData({...horarioData, inicioTarde: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finTarde">Hora fin</Label>
                      <Input 
                        id="finTarde" 
                        type="time"
                        value={horarioData.finTarde}
                        onChange={(e) => setHorarioData({...horarioData, finTarde: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Citas</CardTitle>
                <CardDescription>Personaliza la duración y disponibilidad</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duracionCita">Duración predeterminada de cita</Label>
                  <Select 
                    value={horarioData.duracionCita}
                    onValueChange={(value) => setHorarioData({...horarioData, duracionCita: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Días laborales</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'lunes', label: 'Lunes' },
                      { id: 'martes', label: 'Martes' },
                      { id: 'miercoles', label: 'Miércoles' },
                      { id: 'jueves', label: 'Jueves' },
                      { id: 'viernes', label: 'Viernes' },
                      { id: 'sabado', label: 'Sábado' },
                    ].map((dia) => (
                      <div key={dia.id} className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor={dia.id} className="text-sm">{dia.label}</Label>
                        <Switch 
                          id={dia.id}
                          checked={horarioData.diasLaborales.includes(dia.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setHorarioData({
                                ...horarioData, 
                                diasLaborales: [...horarioData.diasLaborales, dia.id]
                              })
                            } else {
                              setHorarioData({
                                ...horarioData, 
                                diasLaborales: horarioData.diasLaborales.filter(d => d !== dia.id)
                              })
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <Save className="h-4 w-4" />
                    Guardar horario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notificaciones Tab */}
        <TabsContent value="notificaciones" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones por Email</CardTitle>
                <CardDescription>Configura qué notificaciones recibir por correo</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Nuevas citas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe un email cuando se agende una nueva cita
                    </p>
                  </div>
                  <Switch 
                    checked={notificaciones.emailCitas}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, emailCitas: checked})}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Cancelaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificación cuando un paciente cancela
                    </p>
                  </div>
                  <Switch 
                    checked={notificaciones.emailCancelaciones}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, emailCancelaciones: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificaciones WhatsApp</CardTitle>
                <CardDescription>Configura mensajes automáticos a pacientes</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de cita</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorio 24h antes de la cita
                    </p>
                  </div>
                  <Switch 
                    checked={notificaciones.whatsappRecordatorios}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, whatsappRecordatorios: checked})}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Confirmaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar confirmación al agendar cita
                    </p>
                  </div>
                  <Switch 
                    checked={notificaciones.whatsappConfirmaciones}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, whatsappConfirmaciones: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Notificaciones Push</CardTitle>
                <CardDescription>Notificaciones en tiempo real en la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Nuevas citas</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerta cuando se agenda una cita
                    </p>
                  </div>
                  <Switch 
                    checked={notificaciones.pushNuevasCitas}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, pushNuevasCitas: checked})}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Mensajes de pacientes</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerta cuando un paciente envía mensaje
                    </p>
                  </div>
                  <Switch 
                    checked={notificaciones.pushMensajes}
                    onCheckedChange={(checked) => setNotificaciones({...notificaciones, pushMensajes: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sistema Tab */}
        <TabsContent value="sistema" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apariencia
                </CardTitle>
                <CardDescription>Personaliza el aspecto de la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tamaño de fuente</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional
                </CardTitle>
                <CardDescription>Configura idioma y zona horaria</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select defaultValue="america_mexico">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_mexico">América/Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="america_bogota">América/Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="america_buenos_aires">América/Buenos Aires (GMT-3)</SelectItem>
                      <SelectItem value="europe_madrid">Europa/Madrid (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad
                </CardTitle>
                <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Añade una capa extra de seguridad a tu cuenta
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Cambiar contraseña</Label>
                    <p className="text-sm text-muted-foreground">
                      Actualiza tu contraseña periódicamente
                    </p>
                  </div>
                  <Button variant="outline">Cambiar</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Sesiones activas</Label>
                    <p className="text-sm text-muted-foreground">
                      Gestiona los dispositivos conectados
                    </p>
                  </div>
                  <Button variant="outline">Ver sesiones</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
