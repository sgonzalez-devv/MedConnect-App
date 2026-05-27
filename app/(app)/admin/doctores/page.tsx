"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Pencil, Loader2, Users } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface DoctorUser {
  id: string
  email: string
  full_name: string
  profession: string
  user_role: string
  created_at: string
}

export default function AdminDoctoresPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [doctors, setDoctors] = useState<DoctorUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && user?.user_role !== 'admin') {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user?.user_role === 'admin') {
      apiClient.get('/api/admin/doctors')
        .then((res) => setDoctors(res.data?.data || []))
        .catch(() => {})
        .finally(() => setIsLoading(false))
    }
  }, [user])

  if (loading || user?.user_role !== 'admin') return null

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Doctores</h1>
          <p className="text-muted-foreground">Crea y administra las cuentas de médicos</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
          <Link href="/admin/doctores/nuevo">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Doctor
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Médicos Registrados
          </CardTitle>
          <CardDescription>
            Los médicos creados aquí recibirán acceso a la app con las credenciales asignadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No hay médicos registrados aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{doctor.full_name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.email}</p>
                    <div className="flex items-center gap-2">
                      {doctor.profession && (
                        <Badge variant="secondary">{doctor.profession}</Badge>
                      )}
                      <Badge variant="outline" className="capitalize">{doctor.user_role}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/doctores/${doctor.id}/editar`}>
                      <Pencil className="h-4 w-4 mr-1" />Editar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
