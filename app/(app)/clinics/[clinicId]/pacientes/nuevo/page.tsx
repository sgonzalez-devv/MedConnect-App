"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { ArrowLeft, CalendarIcon, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { clinics } from "@/lib/mock-data"
import { getClinicColors } from "@/lib/theme-utils"

export default function ClinicNewPatientPage() {
  const router = useRouter()
  const params = useParams()
  const clinicId = params.clinicId as string
  const clinic = clinics.find((c) => c.id === clinicId)

  const [isLoading, setIsLoading] = useState(false)
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [newAlergia, setNewAlergia] = useState("")
  const [newCondicion, setNewCondicion] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    genero: "",
    direccion: "",
    grupoSanguineo: "",
    alergias: [] as string[],
    condicionesCronicas: [] as string[],
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

  const handleAddAlergia = () => {
    if (newAlergia.trim() && !formData.alergias.includes(newAlergia.trim())) {
      setFormData({
        ...formData,
        alergias: [...formData.alergias, newAlergia.trim()],
      })
      setNewAlergia("")
    }
  }

  const handleRemoveAlergia = (alergia: string) => {
    setFormData({
      ...formData,
      alergias: formData.alergias.filter((a) => a !== alergia),
    })
  }

  const handleAddCondicion = () => {
    if (newCondicion.trim() && !formData.condicionesCronicas.includes(newCondicion.trim())) {
      setFormData({
        ...formData,
        condicionesCronicas: [...formData.condicionesCronicas, newCondicion.trim()],
      })
      setNewCondicion("")
    }
  }

  const handleRemoveCondicion = (condicion: string) => {
    setFormData({
      ...formData,
      condicionesCronicas: formData.condicionesCronicas.filter((c) => c !== condicion),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/clinics/${clinicId}/pacientes`)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/clinics/${clinicId}/pacientes`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className={`border-l-4 pl-4 ${clinicColors.borderL} flex-1`}>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Paciente - {clinic.name}</h1>
          <p className="text-muted-foreground">Registra un nuevo paciente en esta clínica</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre(s)</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre del paciente"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellidos</Label>
                  <Input
                    id="apellido"
                    placeholder="Apellidos del paciente"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
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
                    value={formData.genero}
                    onValueChange={(v) => setFormData({ ...formData, genero: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
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
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+1 809 555 1234"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  placeholder="Calle, número, sector, ciudad"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-medium text-foreground">Información Médica</h3>
              
              <div className="space-y-2">
                <Label>Grupo Sanguíneo</Label>
                <Select
                  value={formData.grupoSanguineo}
                  onValueChange={(v) => setFormData({ ...formData, grupoSanguineo: v })}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alergias */}
              <div className="space-y-2">
                <Label>Alergias</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar alergia"
                    value={newAlergia}
                    onChange={(e) => setNewAlergia(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAlergia())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddAlergia}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.alergias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.alergias.map((alergia) => (
                      <Badge key={alergia} variant="destructive" className="pr-1">
                        {alergia}
                        <button
                          type="button"
                          onClick={() => handleRemoveAlergia(alergia)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Condiciones Crónicas */}
              <div className="space-y-2">
                <Label>Condiciones Crónicas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar condición"
                    value={newCondicion}
                    onChange={(e) => setNewCondicion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCondicion())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddCondicion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.condicionesCronicas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.condicionesCronicas.map((condicion) => (
                      <Badge key={condicion} variant="secondary" className="pr-1">
                        {condicion}
                        <button
                          type="button"
                          onClick={() => handleRemoveCondicion(condicion)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="outline" asChild>
                <Link href={`/clinics/${clinicId}/pacientes`}>Cancelar</Link>
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Registrar Paciente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
