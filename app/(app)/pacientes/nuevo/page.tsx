"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { formatErrorMessage } from "@/lib/error-handling"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

export default function NewPatientPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({ title: 'Debes iniciar sesión para registrar un paciente' })
      return
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.gender || !birthDate) {
      toast({ title: 'Por favor completa todos los campos requeridos' })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'El formato del correo electrónico no es válido' })
      return
    }

    // Validate birth date is in the past
    if (birthDate > new Date()) {
      toast({ title: 'La fecha de nacimiento debe ser en el pasado' })
      return
    }

    setIsLoading(true)

    try {
      const dateOfBirth = `${birthDate.getFullYear()}-${(birthDate.getMonth() + 1).toString().padStart(2, "0")}-${birthDate.getDate().toString().padStart(2, "0")}`

      await apiClient.post('/api/patients', {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: dateOfBirth,
        gender: formData.gender,
        address: formData.address || undefined,
      })

      toast({ title: 'Paciente registrado exitosamente' })
      router.push("/pacientes")
    } catch (error) {
      toast({ title: formatErrorMessage(error, 'Creating patient') })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pacientes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Paciente</h1>
          <p className="text-muted-foreground">Registra un nuevo paciente en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de Registro</CardTitle>
          <CardDescription>
            Completa la información del paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Información Personal</h3>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Nombre completo del paciente"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Nacimiento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? (
                          birthDate.toLocaleDateString("es-DO", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        ) : (
                          <span>Selecciona fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        captionLayout="dropdown-months"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) => setFormData({ ...formData, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-medium text-foreground">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 809 555 1234"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="paciente@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  placeholder="Calle, número, sector, ciudad"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="outline" asChild>
                <Link href="/pacientes">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : "Registrar Paciente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
