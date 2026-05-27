"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, ChevronsUpDown, Check, Plus, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { formatErrorMessage } from "@/lib/error-handling"
import { toast } from "sonner"
import type { Patient } from "@/lib/types"

// WHO growth standard reference data (simplified P3, P15, P50, P85, P97 for weight in kg)
// Ages 0-24 months, male
const WHO_WEIGHT_MALE: Record<number, { p3: number; p50: number; p97: number }> = {
  0: { p3: 2.5, p50: 3.3, p97: 4.4 }, 1: { p3: 3.4, p50: 4.5, p97: 5.8 },
  2: { p3: 4.4, p50: 5.6, p97: 7.1 }, 3: { p3: 5.1, p50: 6.4, p97: 8.0 },
  4: { p3: 5.6, p50: 7.0, p97: 8.7 }, 5: { p3: 6.1, p50: 7.5, p97: 9.3 },
  6: { p3: 6.4, p50: 7.9, p97: 9.8 }, 9: { p3: 7.2, p50: 9.0, p97: 11.0 },
  12: { p3: 7.8, p50: 9.6, p97: 11.8 }, 18: { p3: 8.8, p50: 10.9, p97: 13.4 },
  24: { p3: 9.7, p50: 12.2, p97: 15.3 },
}
const WHO_WEIGHT_FEMALE: Record<number, { p3: number; p50: number; p97: number }> = {
  0: { p3: 2.4, p50: 3.2, p97: 4.2 }, 1: { p3: 3.2, p50: 4.2, p97: 5.5 },
  2: { p3: 4.0, p50: 5.1, p97: 6.6 }, 3: { p3: 4.6, p50: 5.8, p97: 7.5 },
  4: { p3: 5.1, p50: 6.4, p97: 8.2 }, 5: { p3: 5.5, p50: 6.9, p97: 8.8 },
  6: { p3: 5.7, p50: 7.3, p97: 9.3 }, 9: { p3: 6.5, p50: 8.2, p97: 10.5 },
  12: { p3: 7.1, p50: 8.9, p97: 11.5 }, 18: { p3: 8.1, p50: 10.2, p97: 13.2 },
  24: { p3: 9.0, p50: 11.5, p97: 14.8 },
}

function estimatePercentile(weight: number, ageMonths: number, gender: string): number | null {
  const table = gender === 'female' ? WHO_WEIGHT_FEMALE : WHO_WEIGHT_MALE
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b)
  let lo = ages[0], hi = ages[ages.length - 1]
  for (const a of ages) { if (a <= ageMonths) lo = a; if (a >= ageMonths && hi === ages[ages.length - 1]) hi = a }
  const ref = table[lo] || table[hi]
  if (!ref) return null
  const { p3, p50, p97 } = ref
  if (weight <= p3) return 3
  if (weight <= p50) return 3 + ((weight - p3) / (p50 - p3)) * 47
  if (weight <= p97) return 50 + ((weight - p50) / (p97 - p50)) * 47
  return 97
}

interface PercentileRecord {
  id: string
  patient_id: string
  recorded_at: string
  weight_kg: number | null
  height_cm: number | null
  head_circumference_cm: number | null
  age_months: number | null
  notes: string | null
}

export default function PercentilesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientOpen, setPatientOpen] = useState(false)
  const [records, setRecords] = useState<PercentileRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    weight_kg: "",
    height_cm: "",
    head_circumference_cm: "",
    age_months: "",
    notes: "",
  })

  const fetchPatients = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/patients')
      setPatients(data?.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const fetchRecords = useCallback(async (patientId: string) => {
    setLoadingRecords(true)
    try {
      const { data } = await apiClient.get(`/api/percentiles?patient_id=${patientId}`)
      setRecords(data?.data || [])
    } catch {
      setRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }, [])

  useEffect(() => {
    if (selectedPatient) fetchRecords(selectedPatient.id)
  }, [selectedPatient, fetchRecords])

  const handleSaveRecord = async () => {
    if (!selectedPatient) return
    setSaving(true)
    try {
      await apiClient.post('/api/percentiles', {
        patient_id: selectedPatient.id,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        head_circumference_cm: formData.head_circumference_cm ? parseFloat(formData.head_circumference_cm) : null,
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        notes: formData.notes || null,
      })
      toast.success("Registro guardado")
      setDialogOpen(false)
      setFormData({ weight_kg: "", height_cm: "", head_circumference_cm: "", age_months: "", notes: "" })
      fetchRecords(selectedPatient.id)
    } catch (error) {
      toast.error(formatErrorMessage(error, "Guardar registro"))
    } finally {
      setSaving(false)
    }
  }

  const getPercentileBadge = (p: number | null) => {
    if (p === null) return null
    const pct = Math.round(p)
    if (pct < 3 || pct > 97) return <Badge variant="destructive">P{pct}</Badge>
    if (pct < 15 || pct > 85) return <Badge className="bg-amber-500 text-white">P{pct}</Badge>
    return <Badge className="bg-teal-600 text-white">P{pct}</Badge>
  }

  const getTrend = (records: PercentileRecord[], gender: string) => {
    const weightRecords = records.filter(r => r.weight_kg && r.age_months != null).slice(-3)
    if (weightRecords.length < 2) return null
    const percentiles = weightRecords.map(r =>
      estimatePercentile(r.weight_kg!, r.age_months!, gender)
    ).filter(p => p !== null) as number[]
    if (percentiles.length < 2) return null
    const diff = percentiles[percentiles.length - 1] - percentiles[0]
    if (Math.abs(diff) < 5) return { icon: Minus, label: "Estable", color: "text-teal-600" }
    if (diff > 0) return { icon: TrendingUp, label: "En ascenso", color: "text-blue-600" }
    return { icon: TrendingDown, label: "En descenso", color: "text-amber-600" }
  }

  const trend = selectedPatient ? getTrend(records, selectedPatient.gender || 'male') : null

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="border-l-4 border-l-pink-500 pl-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-pink-500" />
            Percentiles Pediátricos
          </h1>
          <p className="text-muted-foreground">Monitoreo de crecimiento según estándares OMS</p>
        </div>
        {selectedPatient && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Registro de Crecimiento</DialogTitle>
                <DialogDescription>Paciente: {selectedPatient.full_name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Edad (meses) *</Label>
                  <Input type="number" min="0" max="216" placeholder="Ej. 12"
                    value={formData.age_months}
                    onChange={(e) => setFormData({ ...formData, age_months: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input type="number" step="0.1" min="0" placeholder="Ej. 8.5"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Talla (cm)</Label>
                    <Input type="number" step="0.1" min="0" placeholder="Ej. 72"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Perímetro Cefálico (cm)</Label>
                  <Input type="number" step="0.1" min="0" placeholder="Ej. 45"
                    value={formData.head_circumference_cm}
                    onChange={(e) => setFormData({ ...formData, head_circumference_cm: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Input placeholder="Observaciones clínicas…"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveRecord} disabled={saving || !formData.age_months} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando…</> : "Guardar Registro"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Patient selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Paciente Pediátrico</CardTitle>
          <CardDescription>Busca y selecciona el paciente para ver o registrar su curva de crecimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-2">
            <Label>Paciente</Label>
            <Popover open={patientOpen} onOpenChange={setPatientOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !selectedPatient && "text-muted-foreground")}>
                  {selectedPatient ? selectedPatient.full_name : "Buscar paciente…"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Filtrar por nombre…" />
                  <CommandList>
                    <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                    <CommandGroup>
                      {patients.map((patient) => (
                        <CommandItem key={patient.id} value={patient.full_name}
                          onSelect={() => { setSelectedPatient(patient); setPatientOpen(false) }}>
                          <Check className={cn("mr-2 h-4 w-4", selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0")} />
                          {patient.full_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          {trend && (
            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <trend.icon className={`h-6 w-6 ${trend.color}`} />
                  <div>
                    <p className="font-medium text-foreground">Tendencia del crecimiento: <span className={trend.color}>{trend.label}</span></p>
                    <p className="text-xs text-muted-foreground">Basado en los últimos 3 registros de peso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Historial de Crecimiento — {selectedPatient.full_name}</CardTitle>
              <CardDescription>
                Registros de peso, talla y perímetro cefálico. Percentiles estimados según tablas OMS.
                Rango normal: P3–P97. <strong>Lo importante es la tendencia, no el número absoluto.</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay registros de crecimiento aún.</p>
                  <p className="text-sm mt-1">Haz clic en "Nuevo Registro" para agregar el primero.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Peso (kg)</TableHead>
                      <TableHead>% Peso</TableHead>
                      <TableHead>Talla (cm)</TableHead>
                      <TableHead>P.Cef. (cm)</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const weightPct = record.weight_kg && record.age_months != null
                        ? estimatePercentile(record.weight_kg, record.age_months, selectedPatient.gender || 'male')
                        : null
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="text-sm">
                            {new Date(record.recorded_at).toLocaleDateString("es-DO")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.age_months != null ? `${record.age_months} m` : "—"}
                          </TableCell>
                          <TableCell className="text-sm">{record.weight_kg ?? "—"}</TableCell>
                          <TableCell>{getPercentileBadge(weightPct)}</TableCell>
                          <TableCell className="text-sm">{record.height_cm ?? "—"}</TableCell>
                          <TableCell className="text-sm">{record.head_circumference_cm ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{record.notes || "—"}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
