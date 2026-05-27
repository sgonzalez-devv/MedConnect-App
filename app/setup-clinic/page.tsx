"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Building2, MapPin, Mail, Phone, Stethoscope, Loader2, Plus, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/error-handling"
import { sanitizePhone, isValidPhone, isValidEmail } from "@/lib/input-utils"

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

interface ClinicFormData {
  name: string
  location: string
  email: string
  telefono: string
  specialty: string
  specialty_custom: string
}

const emptyForm = (): ClinicFormData => ({
  name: "",
  location: "",
  email: "",
  telefono: "",
  specialty: "",
  specialty_custom: "",
})

export default function SetupClinicPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [createdClinics, setCreatedClinics] = useState<string[]>([])
  const [formData, setFormData] = useState<ClinicFormData>(emptyForm())
  const [errors, setErrors] = useState<Partial<ClinicFormData>>({})

  const validate = (): boolean => {
    const newErrors: Partial<ClinicFormData> = {}
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.location.trim()) newErrors.location = "La dirección es requerida"
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo no válido"
    }
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"
    else if (!isValidPhone(formData.telefono)) newErrors.telefono = "Número no válido (mínimo 7 dígitos)"
    if (!formData.specialty) newErrors.specialty = "La especialidad es requerida"
    if (formData.specialty === "custom" && !formData.specialty_custom.trim()) {
      newErrors.specialty_custom = "Especifica la especialidad"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await apiClient.post("/api/clinics", formData)
      setCreatedClinics([...createdClinics, formData.name])
      setFormData(emptyForm())
      setErrors({})
      toast.success(`Clínica "${formData.name}" creada exitosamente`)
    } catch (error) {
      toast.error(formatErrorMessage(error, "Crear clínica"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterApp = () => {
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      {createdClinics.length > 0 && (
        <div className="space-y-2">
          {createdClinics.map((name) => (
            <div key={name} className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
              <CheckCircle className="h-5 w-5 text-teal-600 shrink-0" />
              <span className="text-sm font-medium text-teal-800 dark:text-teal-300">{name}</span>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            {createdClinics.length === 0 ? "Configura tu primera clínica" : "Agregar otra clínica"}
          </CardTitle>
          <CardDescription>
            {createdClinics.length === 0
              ? "Antes de usar la app, registra al menos una clínica"
              : "Puedes agregar otra clínica o ir directamente a la app"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la clínica *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Ej. Centro Médico Naco"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad *</Label>
              <Select
                value={formData.specialty}
                onValueChange={(v) => setFormData({ ...formData, specialty: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la especialidad" />
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

            {formData.specialty === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="specialty_custom">Especificar especialidad *</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="specialty_custom"
                    placeholder="Ej. Medicina Funcional"
                    value={formData.specialty_custom}
                    onChange={(e) => setFormData({ ...formData, specialty_custom: e.target.value })}
                    className="pl-9"
                  />
                </div>
                {errors.specialty_custom && <p className="text-xs text-destructive">{errors.specialty_custom}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">Dirección *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Av. Tiradentes #25, Naco, Santo Domingo"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pl-9"
                />
              </div>
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@clinica.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+1 809 555 1234"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: sanitizePhone(e.target.value) })}
                    className="pl-9"
                  />
                </div>
                {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando…</>
                ) : (
                  <><Building2 className="h-4 w-4 mr-2" />{createdClinics.length === 0 ? "Crear Clínica" : "Agregar Clínica"}</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {createdClinics.length > 0 && (
        <div className="flex flex-col gap-3">
          <Button onClick={handleEnterApp} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            Entrar a MedConnect
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            También puedes agregar más clínicas desde dentro de la app en cualquier momento
          </p>
        </div>
      )}
    </div>
  )
}
