"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  User, Clock, Bell, Shield, Palette, Globe, Save, Camera, Loader2, KeyRound, Eye, EyeOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase-client"
import { toast } from "@/hooks/use-toast"
import { formatErrorMessage } from "@/lib/error-handling"
import { sanitizePhone } from "@/lib/input-utils"

interface SchedulePrefs {
  morning_start: string
  morning_end: string
  afternoon_start: string
  afternoon_end: string
  appointment_duration: string
  working_days: string[]
}

interface NotificationPrefs {
  email_appointments: boolean
  email_cancellations: boolean
  whatsapp_reminders: boolean
  whatsapp_confirmations: boolean
  push_new_appointments: boolean
  push_messages: boolean
}

const DEFAULT_SCHEDULE: SchedulePrefs = {
  morning_start: "08:00",
  morning_end: "14:00",
  afternoon_start: "16:00",
  afternoon_end: "20:00",
  appointment_duration: "30",
  working_days: ["lunes", "martes", "miercoles", "jueves", "viernes"],
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  email_appointments: true,
  email_cancellations: true,
  whatsapp_reminders: true,
  whatsapp_confirmations: true,
  push_new_appointments: true,
  push_messages: false,
}

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    especialidad: "",
  })

  const [horario, setHorario] = useState<SchedulePrefs>(DEFAULT_SCHEDULE)
  const [notificaciones, setNotificaciones] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata ?? {}
      setProfileData({
        nombre: (meta.full_name as string) ?? "",
        email: user.email ?? "",
        telefono: (meta.telefono as string) ?? "",
        especialidad: (meta.profession as string) ?? "",
      })
      if (meta.schedule) {
        setHorario({ ...DEFAULT_SCHEDULE, ...(meta.schedule as Partial<SchedulePrefs>) })
      }
      if (meta.notification_preferences) {
        setNotificaciones({ ...DEFAULT_NOTIFICATIONS, ...(meta.notification_preferences as Partial<NotificationPrefs>) })
      }
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.nombre,
          telefono: profileData.telefono,
          profession: profileData.especialidad,
        },
      })
      if (error) throw error
      toast({ title: "Perfil actualizado exitosamente" })
    } catch (err) {
      toast({ title: formatErrorMessage(err, "Guardando perfil"), variant: "destructive" })
    } finally {
      setSavingProfile(false)
    }
  }

  const saveSchedule = async () => {
    setSavingSchedule(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { schedule: horario },
      })
      if (error) throw error
      toast({ title: "Horario guardado exitosamente" })
    } catch (err) {
      toast({ title: formatErrorMessage(err, "Guardando horario"), variant: "destructive" })
    } finally {
      setSavingSchedule(false)
    }
  }

  const saveNotifications = async () => {
    setSavingNotifications(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { notification_preferences: notificaciones },
      })
      if (error) throw error
      toast({ title: "Preferencias guardadas exitosamente" })
    } catch (err) {
      toast({ title: formatErrorMessage(err, "Guardando notificaciones"), variant: "destructive" })
    } finally {
      setSavingNotifications(false)
    }
  }

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "La contraseña debe tener al menos 8 caracteres", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast({ title: "Contraseña actualizada exitosamente" })
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    } catch (err) {
      toast({ title: formatErrorMessage(err, "Cambiando contraseña"), variant: "destructive" })
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = profileData.nombre
    ? profileData.nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (profileData.email.charAt(0).toUpperCase() || "?")

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    )
  }

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

        {/* ── Perfil ── */}
        <TabsContent value="perfil" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Tu foto se mostrará en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl bg-teal-100 text-teal-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2" disabled>
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
                      onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">El correo no se puede cambiar directamente</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={profileData.telefono}
                      onChange={(e) =>
                        setProfileData({ ...profileData, telefono: sanitizePhone(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad</Label>
                    <Input
                      id="especialidad"
                      value={profileData.especialidad}
                      onChange={(e) => setProfileData({ ...profileData, especialidad: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="gap-2 bg-teal-600 hover:bg-teal-700"
                  >
                    {savingProfile ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                    ) : (
                      <><Save className="h-4 w-4" />Guardar cambios</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Horario ── */}
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
                      <Label>Hora inicio</Label>
                      <Input
                        type="time"
                        value={horario.morning_start}
                        onChange={(e) => setHorario({ ...horario, morning_start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora fin</Label>
                      <Input
                        type="time"
                        value={horario.morning_end}
                        onChange={(e) => setHorario({ ...horario, morning_end: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Turno Tarde</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hora inicio</Label>
                      <Input
                        type="time"
                        value={horario.afternoon_start}
                        onChange={(e) => setHorario({ ...horario, afternoon_start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora fin</Label>
                      <Input
                        type="time"
                        value={horario.afternoon_end}
                        onChange={(e) => setHorario({ ...horario, afternoon_end: e.target.value })}
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
                  <Label>Duración predeterminada de cita</Label>
                  <Select
                    value={horario.appointment_duration}
                    onValueChange={(v) => setHorario({ ...horario, appointment_duration: v })}
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
                      { id: "lunes", label: "Lunes" },
                      { id: "martes", label: "Martes" },
                      { id: "miercoles", label: "Miércoles" },
                      { id: "jueves", label: "Jueves" },
                      { id: "viernes", label: "Viernes" },
                      { id: "sabado", label: "Sábado" },
                    ].map((dia) => (
                      <div key={dia.id} className="flex items-center justify-between rounded-lg border p-3">
                        <Label className="text-sm">{dia.label}</Label>
                        <Switch
                          checked={horario.working_days.includes(dia.id)}
                          onCheckedChange={(checked) =>
                            setHorario({
                              ...horario,
                              working_days: checked
                                ? [...horario.working_days, dia.id]
                                : horario.working_days.filter((d) => d !== dia.id),
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveSchedule}
                    disabled={savingSchedule}
                    className="gap-2 bg-teal-600 hover:bg-teal-700"
                  >
                    {savingSchedule ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                    ) : (
                      <><Save className="h-4 w-4" />Guardar horario</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Notificaciones ── */}
        <TabsContent value="notificaciones" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones por Email</CardTitle>
                <CardDescription>Configura qué notificaciones recibir por correo</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  {
                    key: "email_appointments" as const,
                    label: "Nuevas citas",
                    desc: "Recibe un email cuando se agende una nueva cita",
                  },
                  {
                    key: "email_cancellations" as const,
                    label: "Cancelaciones",
                    desc: "Notificación cuando un paciente cancela",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificaciones[item.key]}
                      onCheckedChange={(v) => setNotificaciones({ ...notificaciones, [item.key]: v })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificaciones WhatsApp</CardTitle>
                <CardDescription>Configura mensajes automáticos a pacientes</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  {
                    key: "whatsapp_reminders" as const,
                    label: "Recordatorios de cita",
                    desc: "Enviar recordatorio 24h antes de la cita",
                  },
                  {
                    key: "whatsapp_confirmations" as const,
                    label: "Confirmaciones",
                    desc: "Enviar confirmación al agendar cita",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificaciones[item.key]}
                      onCheckedChange={(v) => setNotificaciones({ ...notificaciones, [item.key]: v })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Notificaciones Push</CardTitle>
                <CardDescription>Notificaciones en tiempo real en la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    key: "push_new_appointments" as const,
                    label: "Nuevas citas",
                    desc: "Alerta cuando se agenda una cita",
                  },
                  {
                    key: "push_messages" as const,
                    label: "Mensajes de pacientes",
                    desc: "Alerta cuando un paciente envía mensaje",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificaciones[item.key]}
                      onCheckedChange={(v) => setNotificaciones({ ...notificaciones, [item.key]: v })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 flex justify-end">
              <Button
                onClick={saveNotifications}
                disabled={savingNotifications}
                className="gap-2 bg-teal-600 hover:bg-teal-700"
              >
                {savingNotifications ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                ) : (
                  <><Save className="h-4 w-4" />Guardar preferencias</>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Sistema ── */}
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
                  <Select value={theme ?? "system"} onValueChange={setTheme}>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional
                </CardTitle>
                <CardDescription>Zona horaria y configuración regional</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select defaultValue="america_santo_domingo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_santo_domingo">América/Santo Domingo (AST)</SelectItem>
                      <SelectItem value="america_new_york">América/Nueva York (EST/EDT)</SelectItem>
                      <SelectItem value="america_mexico_city">América/Ciudad de México (CST/CDT)</SelectItem>
                      <SelectItem value="america_bogota">América/Bogotá (COT)</SelectItem>
                      <SelectItem value="america_buenos_aires">América/Buenos Aires (ART)</SelectItem>
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
                    <Label>Cambiar contraseña</Label>
                    <p className="text-sm text-muted-foreground">
                      Actualiza tu contraseña de acceso
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowPasswordForm((v) => !v)}
                  >
                    <KeyRound className="h-4 w-4" />
                    {showPasswordForm ? "Cancelar" : "Cambiar"}
                  </Button>
                </div>

                {showPasswordForm && (
                  <div className="rounded-lg border p-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowNewPwd((v) => !v)}
                          >
                            {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPwd ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowConfirmPwd((v) => !v)}
                          >
                            {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={changePassword}
                        disabled={savingPassword}
                        className="gap-2 bg-teal-600 hover:bg-teal-700"
                      >
                        {savingPassword ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Actualizando…</>
                        ) : (
                          <><Save className="h-4 w-4" />Actualizar contraseña</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
