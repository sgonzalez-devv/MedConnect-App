"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, AlertCircle } from "lucide-react"
import type { UserClinic } from "@/context/clinic-context"

interface ClinicConfirmDialogProps {
  open: boolean
  onConfirm: (clinicId: string) => void
  onCancel: () => void
  action: "paciente" | "cita"
  clinics: UserClinic[]
  defaultClinicId: string | null
}

export function ClinicConfirmDialog({
  open,
  onConfirm,
  onCancel,
  action,
  clinics,
  defaultClinicId,
}: ClinicConfirmDialogProps) {
  const [selectedClinicId, setSelectedClinicId] = useState<string>(defaultClinicId ?? "")

  useEffect(() => {
    if (defaultClinicId) setSelectedClinicId(defaultClinicId)
  }, [defaultClinicId, open])

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId)
  const actionLabel = action === "paciente" ? "un paciente" : "una cita"
  const actionTitle = action === "paciente" ? "Registrar Paciente" : "Crear Cita"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionTitle}</DialogTitle>
          <DialogDescription>
            Confirma en qué clínica se va a registrar {actionLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 p-4 bg-teal-600 rounded-xl">
            <Building2 className="h-5 w-5 text-teal-100 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-teal-200 font-medium uppercase tracking-wider mb-0.5">
                Clínica seleccionada
              </p>
              <p className="font-semibold text-white">
                {selectedClinic?.name ?? "—"}
              </p>
              {selectedClinic?.location && (
                <p className="text-xs text-teal-200 mt-0.5">{selectedClinic.location}</p>
              )}
            </div>
          </div>

          {clinics.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                ¿Quieres crearlo en otra clínica?
              </p>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Cambiar clínica…" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(selectedClinicId)}
            disabled={!selectedClinicId}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Confirmar y Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
