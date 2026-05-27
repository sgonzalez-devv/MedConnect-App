"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, UserPlus, Mail, Lock, User, Stethoscope } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/error-handling"
import { useAuth } from "@/hooks/use-auth"

const PROFESSIONS = [
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

export default function NuevoDoctorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    profession: "",
    profession_custom: "",
  })
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  if (user?.user_role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  const validate = () => {
    const newErrors: Partial<typeof formData> = {}
    if (!formData.full_name.trim()) newErrors.full_name = "El nombre es requerido"
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de correo no válido"
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres"
    }
    if (!formData.profession) newErrors.profession = "La profesión es requerida"
    if (formData.profession === 'custom' && !formData.profession_custom.trim()) {
      newErrors.profession_custom = "Especifica la profesión"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const profession = formData.profession === 'custom' ? formData.profession_custom : formData.profession
      await apiClient.post('/api/admin/doctors', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        profession,
      })
      toast.success(`Doctor ${formData.full_name} creado exitosamente`)
      router.push('/admin/doctores')
    } catch (error) {
      toast.error(formatErrorMessage(error, "Crear doctor"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/doctores"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Doctor</h1>
          <p className="text-sm text-muted-foreground">Crea una cuenta para un nuevo médico</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Datos del Médico
          </CardTitle>
          <CardDescription>
            El doctor recibirá acceso con el correo y contraseña que ingreses aquí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="full_name" placeholder="Dr. Juan Pérez" value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="pl-9" />
              </div>
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="doctor@clinica.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-9" />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña inicial *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-9" />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">El doctor podrá cambiar su contraseña después de iniciar sesión</p>
            </div>

            <div className="space-y-2">
              <Label>Profesión / Especialidad *</Label>
              <Select value={formData.profession} onValueChange={(v) => setFormData({ ...formData, profession: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona la profesión" /></SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  <SelectItem value="custom">Especificar otra…</SelectItem>
                </SelectContent>
              </Select>
              {errors.profession && <p className="text-xs text-destructive">{errors.profession}</p>}
            </div>

            {formData.profession === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="profession_custom">Especificar profesión *</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="profession_custom" placeholder="Ej. Medicina Funcional" value={formData.profession_custom}
                    onChange={(e) => setFormData({ ...formData, profession_custom: e.target.value })} className="pl-9" />
                </div>
                {errors.profession_custom && <p className="text-xs text-destructive">{errors.profession_custom}</p>}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/admin/doctores">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando…</> : <><UserPlus className="h-4 w-4 mr-2" />Crear Doctor</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
