"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Plus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Users,
  Grid3X3,
  List,
  AlertTriangle,
} from "lucide-react"
import { formatDateShort, calculateAge } from "@/lib/date-utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/error-handling"
import type { Patient } from "@/lib/types"

export default function PatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  useEffect(() => {
    async function fetchPatients() {
      if (!user?.clinic_id) return

      try {
        setLoading(true)

        const res = await fetch("/api/patients")

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP ${res.status}`)
        }

        const json = await res.json()
        setPatients(json.data || [])
      } catch (err) {
        const message = formatErrorMessage(err, "Fetching patients")
        toast.error(message)
        console.error("Patients fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [user?.clinic_id])

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.nombre} ${patient.apellido}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.telefono.includes(query)
    )
  })

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground">
              {patients.length} pacientes registrados en el sistema
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="btn-primary" asChild>
                <Link href="/pacientes/nuevo">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Paciente
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Registrar un nuevo paciente en el sistema</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Search and Filters */}
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-10 input-focus"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="transition-all duration-200"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vista de lista</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="transition-all duration-200"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vista de tarjetas</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List/Grid */}
        {loading ? (
          <Card className="card-hover overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-40" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                    <div className="h-3 bg-muted rounded w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <Card className="card-hover overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Paciente</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Contacto</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Grupo Sanguíneo</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Citas</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Registro</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => {
                      const initials = `${patient.nombre[0]}${patient.apellido[0]}`
                      const age = calculateAge(patient.fechaNacimiento)

                      return (
                        <TableRow 
                          key={patient.id} 
                          className="hover:bg-teal-50/50 transition-colors duration-200"
                        >
                          <TableCell>
                            <Link
                              href={`/pacientes/${patient.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-200">
                                <AvatarFallback className="bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 text-sm font-medium">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground group-hover:text-teal-700 transition-colors duration-200">
                                  {patient.nombre} {patient.apellido}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {age} años · {patient.genero === "masculino" ? "Masculino" : "Femenino"}
                                </p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3.5 h-3.5 text-teal-600" />
                                <span>{patient.telefono}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-40">{patient.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="font-mono bg-red-50 text-red-700 border-red-200">
                              {patient.grupoSanguineo}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium">0</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {0 === 0 
                                  ? "Sin citas registradas" 
                                  : `0 citas en historial`}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                            {formatDateShort(patient.fechaRegistro)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-teal-50">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href={`/pacientes/${patient.id}`}>
                                    Ver perfil completo
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href={`/calendario/nueva-cita?paciente=${patient.id}`}>
                                    Agendar nueva cita
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  Editar información
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const initials = `${patient.nombre[0]}${patient.apellido[0]}`
              const age = calculateAge(patient.fechaNacimiento)

              return (
                <Card key={patient.id} className="card-hover group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-teal-200 transition-all duration-200">
                          <AvatarFallback className="bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/pacientes/${patient.id}`}
                            className="font-medium text-foreground hover:text-teal-700 transition-colors duration-200"
                          >
                            {patient.nombre} {patient.apellido}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {age} años · {patient.genero === "masculino" ? "M" : "F"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono bg-red-50 text-red-700 border-red-200">
                        {patient.grupoSanguineo}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-teal-600" />
                        <span>{patient.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    </div>

                    {patient.alergias.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            {patient.alergias.slice(0, 2).map((alergia) => (
                              <Badge key={alergia} variant="destructive" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200">
                                {alergia}
                              </Badge>
                            ))}
                            {patient.alergias.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{patient.alergias.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium mb-1">Alergias registradas:</p>
                          <ul className="text-sm">
                            {patient.alergias.map(a => <li key={a}>• {a}</li>)}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            0 citas
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Total de citas en el historial</TooltipContent>
                      </Tooltip>
                      <Button variant="outline" size="sm" asChild className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-200">
                        <Link href={`/pacientes/${patient.id}`}>
                          Ver perfil
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {filteredPatients.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                No se encontraron pacientes
              </p>
              <p className="text-muted-foreground mb-4">
                Intenta con otro término de búsqueda o registra un nuevo paciente
              </p>
              <Button className="btn-primary" asChild>
                <Link href="/pacientes/nuevo">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Paciente
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
