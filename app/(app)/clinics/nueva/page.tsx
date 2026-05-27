"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Building2, Loader2, MapPin, Mail, Phone } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/error-handling"
import { sanitizePhone, isValidPhone, isValidEmail } from "@/lib/input-utils"

export default function NewClinicPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", location: "", email: "", telefono: "" })
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const sanitized = name === "telefono" ? sanitizePhone(value) : value
    setFormData((prev) => ({ ...prev, [name]: sanitized }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { name, location, email, telefono } = formData
    const newErrors: Partial<typeof formData> = {}
    if (!name.trim()) newErrors.name = "El nombre es requerido"
    if (!location.trim()) newErrors.location = "La dirección es requerida"
    if (!email.trim()) newErrors.email = "El correo es requerido"
    else if (!isValidEmail(email)) newErrors.email = "Formato de correo no válido"
    if (!telefono.trim()) newErrors.telefono = "El teléfono es requerido"
    else if (!isValidPhone(telefono)) newErrors.telefono = "Número de teléfono no válido"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setIsLoading(true)
    try {
      await apiClient.post("/api/clinics", formData)
      toast.success("Clínica creada exitosamente")
      router.push("/clinics")
      router.refresh()
    } catch (error) {
      toast.error(formatErrorMessage(error, "Crear clínica"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clinics">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Clínica</h1>
          <p className="text-sm text-muted-foreground">Registra una nueva clínica en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            Datos de la Clínica
          </CardTitle>
          <CardDescription>
            Todos los campos son obligatorios para registrar la clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la clínica *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej. Centro Médico Naco"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación / Dirección *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  placeholder="Ej. Av. Tiradentes #25, Naco, Santo Domingo"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contacto@clinica.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="+1 809 555 1234"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`pl-9 ${errors.telefono ? "border-destructive" : ""}`}
                />
              </div>
              {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/clinics">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando…
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Crear Clínica
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
