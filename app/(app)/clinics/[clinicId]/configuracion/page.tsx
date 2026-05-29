"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Clock, Bell, Shield, Save, Lock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import { formatErrorMessage } from "@/lib/error-handling"
import { sanitizePhone, isValidPhone, isValidEmail } from "@/lib/input-utils"
import { toast } from "@/hooks/use-toast"
import { Building2 } from "lucide-react"

const SPECIALTIES = [
  "Medicina General",
  "Pediatría",
  "Ginecología y Obstetricia",
  "Cardiología",
  "Dermatología",
  "Oftalmología",
  "Traumatología y Ortopedia",
  "Psiquiatría",
  "Neurología",
  "Gastroenterología",
  "Endocrinología",
  "Urología",
  "Otorrinolaringología",
  "Neumología",
  "Reumatología",
  "Cirugía General",
  "Medicina Interna",
  "Fisiatría y Rehabilitación",
]

interface ClinicSettings {
  schedule?: {
    morning_start?: string
    morning_end?: string
    afternoon_start?: string
    afternoon_end?: string
    appointment_duration?: number
  }
  notifications?: {
    email_appointments?: boolean
    email_cancellations?: boolean
    whatsapp_reminders?: boolean
    whatsapp_confirmations?: boolean
  }
  system?: {
    timezone?: string
    backup_enabled?: boolean
  }
}

interface ClinicData {
  id: string
  name: string
  location: string
  email: string
  telefono: string
  specialty?: string
  specialty_custom?: string
  settings?: ClinicSettings
}

const DEFAULT_SCHEDULE = {
  morning_start: "08:00",
  morning_end: "14:00",
  afternoon_start: "16:00",
  afternoon_end: "20:00",
  appointment_duration: 30,
}

const DEFAULT_NOTIFICATIONS = {
  email_appointments: true,
  email_cancellations: true,
  whatsapp_reminders: true,
  whatsapp_confirmations: true,
}

const DEFAULT_SYSTEM = {
  timezone: "America/Santo_Domingo",
  backup_enabled: true,
}

export default function ClinicConfiguracionPage() {
  const params = useParams()
  const clinicId = params.clinicId as string
  const { user } = useAuth()

  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingSystem, setSavingSystem] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ClinicData, string>>>({})

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    telefono: "",
    specialty: "",
    specialty_custom: "",
  })

  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [systemSettings, setSystemSettings] = useState(DEFAULT_SYSTEM)

  // Full settings state used for partial updates (preserve other keys)
  const [currentSettings, setCurrentSettings] = useState<ClinicSettings>({})

  const canEdit = user?.user_role === "admin" || user?.user_role === "doctor"

  useEffect(() => {
    async function fetchClinic() {
      try {
        const res = await apiClient.get<{ data: ClinicData }>(`/api/clinics/${clinicId}`)
        const data = res.data.data
        setClinic(data)
        setFormData({
          name: data.name ?? "",
          location: data.location ?? "",
          email: data.email ?? "",
          telefono: data.telefono ?? "",
          specialty: data.specialty ?? "",
          specialty_custom: data.specialty_custom ?? "",
        })

        const s = data.settings ?? {}
        setCurrentSettings(s)
        setSchedule({ ...DEFAULT_SCHEDULE, ...(s.schedule ?? {}) })
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(s.notifications ?? {}) })
        setSystemSettings({ ...DEFAULT_SYSTEM, ...(s.system ?? {}) })
      } catch (err) {
        toast({ title: formatErrorMessage(err, "Cargando clínica"), variant: "destructive" })
      } finally {
        setFetchLoading(false)
      }
    }
    fetchClinic()
  }, [clinicId])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClinicData, string>> = {}
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.location.trim()) newErrors.location = "La dirección es requerida"
    if (!formData.email.trim()) newErrors.email = "El correo es requerido"
    else if (!isValidEmail(formData.email)) newErrors.email = "Formato de correo no válido"
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"
    else if (!isValidPhone(formData.telefono)) newErrors.telefono = "Mínimo 7 dígitos"
    if (!formData.specialty) newErrors.specialty = "La especialidad es requerida"
    if (formData.specialty === "custom" && !formData.specialty_custom.trim()) {
      newErrors.specialty_custom = "Especifica la especialidad"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaveLoading(true)
    try {
      const res = await apiClient.patch<{ data: ClinicData }>(`/api/clinics/${clinicId}`, {
        name: formData.name,
        location: formData.location,
        email: formData.email,
        telefono: formData.telefono,
        specialty: formData.specialty,
        specialty_custom: formData.specialty === "custom" ? formData.specialty_custom : undefined,
      })
      setClinic(res.data.data)
      toast({ title: "Clínica actualizada exitosamente" })
    } catch (err) {
      toast({ title: formatErrorMessage(err, "Guardando clínica"), variant: "destructive" })
    } finally {
      setSaveLoading(false)
    }
  }

  const saveSettings = async (
    patch: ClinicSettings,
    setLoading: (v: boolean) => void,
    successMsg: string,
  ) => {
    setLoading(true)
    try {
      const merged: ClinicSettings = { ...currentSettings, ...patch }
      await apiClient.patch(`/api/clinics/${clinicId}`, { settings: merged })
      setCurrentSettings(merged)
      toast({ title: successMsg })
    } catch (err) {
      toast({ title: formatErrorMessage(err, "Guardando configuración"), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="p-6">
        <p className="text-center py-12 text-muted-foreground">Clínica no encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="border-l-4 border-l-teal-500 pl-4">
        <h1 className="text-2xl font-bold text-foreground">Configuración — {clinic.name}</h1>
        <p className="text-muted-foreground">Gestiona la información y preferencias de la clínica</p>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300">
          <Lock className="h-4 w-4 shrink-0" />
          <p className="text-sm">Solo tienes acceso de lectura. Contacta al administrador para editar la información de la clínica.</p>
        </div>
      )}

      <Tabs defaultValue="clinica" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="clinica" className="gap-2">
            <Building2 className="h-4 w-4" />
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

        {/* ── Clínica ── */}
        <TabsContent value="clinica" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Clínica</CardTitle>
              <CardDescription>Actualiza el nombre, dirección y datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la clínica *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors((p) => ({ ...p, name: undefined })) }}
                    disabled={!canEdit}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(v) => { setFormData({ ...formData, specialty: v }); setErrors((p) => ({ ...p, specialty: undefined })) }}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className={errors.specialty ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                      <SelectItem value="custom">Especificar otra…</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.specialty && <p className="text-xs text-destructive">{errors.specialty}</p>}
                </div>
              </div>

              {formData.specialty === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="specialty_custom">Especialidad personalizada *</Label>
                  <Input
                    id="specialty_custom"
                    placeholder="Ej. Medicina Funcional"
                    value={formData.specialty_custom}
                    onChange={(e) => { setFormData({ ...formData, specialty_custom: e.target.value }); setErrors((p) => ({ ...p, specialty_custom: undefined })) }}
                    disabled={!canEdit}
                    className={errors.specialty_custom ? "border-destructive" : ""}
                  />
                  {errors.specialty_custom && <p className="text-xs text-destructive">{errors.specialty_custom}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Dirección *</Label>
                <Input
                  id="location"
                  placeholder="Av. Tiradentes #25, Naco, Santo Domingo"
                  value={formData.location}
                  onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setErrors((p) => ({ ...p, location: undefined })) }}
                  disabled={!canEdit}
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@clinica.com"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors((p) => ({ ...p, email: undefined })) }}
                    disabled={!canEdit}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+1 809 555 1234"
                    value={formData.telefono}
                    onChange={(e) => { setFormData({ ...formData, telefono: sanitizePhone(e.target.value) }); setErrors((p) => ({ ...p, telefono: undefined })) }}
                    disabled={!canEdit}
                    className={errors.telefono ? "border-destructive" : ""}
                  />
                  {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
                </div>
              </div>

              {canEdit && (
                <Button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {saveLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                  ) : (
                    <><Save className="h-4 w-4" />Guardar Cambios</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Horario ── */}
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
                    <Label>Inicio</Label>
                    <Input
                      type="time"
                      value={schedule.morning_start}
                      onChange={(e) => setSchedule({ ...schedule, morning_start: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fin</Label>
                    <Input
                      type="time"
                      value={schedule.morning_end}
                      onChange={(e) => setSchedule({ ...schedule, morning_end: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-4">Horario de Tarde</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Inicio</Label>
                    <Input
                      type="time"
                      value={schedule.afternoon_start}
                      onChange={(e) => setSchedule({ ...schedule, afternoon_start: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fin</Label>
                    <Input
                      type="time"
                      value={schedule.afternoon_end}
                      onChange={(e) => setSchedule({ ...schedule, afternoon_end: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Duración de cita por defecto</Label>
                <Select
                  value={String(schedule.appointment_duration)}
                  onValueChange={(v) => setSchedule({ ...schedule, appointment_duration: Number(v) })}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-48">
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
              {canEdit && (
                <Button
                  onClick={() => saveSettings({ schedule }, setSavingSchedule, "Horario guardado exitosamente")}
                  disabled={savingSchedule}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {savingSchedule ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                  ) : (
                    <><Save className="h-4 w-4" />Guardar Horario</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notificaciones ── */}
        <TabsContent value="notificaciones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Controla qué notificaciones deseas recibir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { id: "email_appointments" as const, label: "Email para nuevas citas", desc: "Recibe notificaciones de nuevas citas por email" },
                  { id: "email_cancellations" as const, label: "Email para cancelaciones", desc: "Recibe notificaciones de cancelaciones" },
                  { id: "whatsapp_reminders" as const, label: "Recordatorios por WhatsApp", desc: "Envía recordatorios a los pacientes por WhatsApp" },
                  { id: "whatsapp_confirmations" as const, label: "Confirmaciones por WhatsApp", desc: "Solicita confirmación de citas por WhatsApp" },
                ].map((item, i, arr) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.id]}
                        onCheckedChange={(v) => setNotifications({ ...notifications, [item.id]: v })}
                        disabled={!canEdit}
                      />
                    </div>
                    {i < arr.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
              {canEdit && (
                <Button
                  onClick={() => saveSettings({ notifications }, setSavingNotifications, "Preferencias guardadas")}
                  disabled={savingNotifications}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {savingNotifications ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                  ) : (
                    <><Save className="h-4 w-4" />Guardar Preferencias</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sistema ── */}
        <TabsContent value="sistema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Configuración avanzada de la clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Respaldos automáticos</Label>
                  <p className="text-sm text-muted-foreground">Realiza respaldos automáticos de los datos de la clínica</p>
                </div>
                <Switch
                  checked={systemSettings.backup_enabled}
                  onCheckedChange={(v) => setSystemSettings({ ...systemSettings, backup_enabled: v })}
                  disabled={!canEdit}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Zona horaria</Label>
                <Select
                  value={systemSettings.timezone}
                  onValueChange={(v) => setSystemSettings({ ...systemSettings, timezone: v })}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Santo_Domingo">America/Santo_Domingo (AST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                    <SelectItem value="America/Toronto">America/Toronto (EST/EDT)</SelectItem>
                    <SelectItem value="America/Mexico_City">America/Mexico_City (CST/CDT)</SelectItem>
                    <SelectItem value="America/Bogota">America/Bogota (COT)</SelectItem>
                    <SelectItem value="America/Buenos_Aires">America/Buenos_Aires (ART)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {canEdit && (
                <Button
                  onClick={() => saveSettings({ system: systemSettings }, setSavingSystem, "Configuración del sistema guardada")}
                  disabled={savingSystem}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {savingSystem ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
                  ) : (
                    <><Save className="h-4 w-4" />Guardar Configuración</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
