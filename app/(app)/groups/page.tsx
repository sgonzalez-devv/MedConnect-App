"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { clinicGroups, clinics } from "@/lib/mock-data"
import { Building2, ArrowRight } from "lucide-react"

export default function GroupsPage() {
  const getClinicName = (clinicId: string) => {
    return clinics.find((c) => c.id === clinicId)?.name || clinicId
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tus Grupos de Clínicas</h1>
          <p className="text-muted-foreground">
            Gestiona múltiples clínicas desde una vista consolidada
          </p>
        </div>
      </div>

      {/* Groups Grid */}
      {clinicGroups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay grupos creados aún. Crea uno para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinicGroups.map((group) => (
            <Card key={group.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{group.name}</span>
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  {group.clinicIds.length} {group.clinicIds.length === 1 ? "clínica" : "clínicas"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Clínicas:</p>
                  <ul className="space-y-1">
                    {group.clinicIds.map((clinicId) => (
                      <li key={clinicId} className="text-sm text-foreground">
                        • {getClinicName(clinicId)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4">
                  <Link href={`/groups/${group.id}/dashboard`} className="block">
                    <Button className="w-full gap-2">
                      Ver Dashboard <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
