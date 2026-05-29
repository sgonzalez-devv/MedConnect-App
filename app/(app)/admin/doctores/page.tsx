"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserPlus, Loader2, Users, Search, MoreVertical, Trash2, Pencil, CheckCircle2, Clock } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/error-handling"

interface UserRecord {
  id: string
  email: string
  full_name: string
  user_role: string
  profession: string | null
  created_at: string
  last_sign_in: string | null
  confirmed: boolean
}

const roleConfig: Record<string, { label: string; class: string }> = {
  admin: { label: "Admin", class: "bg-red-600 text-white border-transparent" },
  doctor: { label: "Doctor", class: "bg-blue-600 text-white border-transparent" },
  staff: { label: "Staff", class: "bg-amber-500 text-white border-transparent" },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??"
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && user?.user_role !== "admin") router.push("/dashboard")
  }, [loading, user, router])

  useEffect(() => {
    if (user?.user_role === "admin") {
      apiClient.get("/api/admin/doctors")
        .then((res) => setUsers(res.data?.data || []))
        .catch((err) => toast.error(formatErrorMessage(err, "Cargar usuarios")))
        .finally(() => setIsLoading(false))
    }
  }, [user])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.delete(`/api/admin/doctors?id=${deleteTarget.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      toast.success(`Usuario ${deleteTarget.full_name || deleteTarget.email} eliminado`)
    } catch (err) {
      toast.error(formatErrorMessage(err, "Eliminar usuario"))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading || user?.user_role !== "admin") return null

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.profession || "").toLowerCase().includes(search.toLowerCase())
  )

  const byRole = {
    admin: filtered.filter((u) => u.user_role === "admin"),
    doctor: filtered.filter((u) => u.user_role === "doctor"),
    staff: filtered.filter((u) => u.user_role === "staff"),
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra las cuentas de doctores y staff</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
          <Link href="/admin/doctores/nuevo">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, correo o especialidad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {(["doctor", "staff", "admin"] as const).map((role) => {
            const list = byRole[role]
            if (list.length === 0) return null
            const cfg = roleConfig[role]
            return (
              <Card key={role}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {role === "doctor" ? "Médicos" : role === "staff" ? "Staff" : "Administradores"}
                    <Badge variant="secondary" className="ml-1">{list.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-medium">
                          {getInitials(u.full_name || u.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {u.full_name || <span className="text-muted-foreground italic">Sin nombre</span>}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>
                          {u.profession && (
                            <Badge variant="secondary" className="text-xs">{u.profession}</Badge>
                          )}
                          {u.confirmed ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3 w-3" />Confirmado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <Clock className="h-3 w-3" />Pendiente
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/doctores/${u.id}/editar`}>
                              <Pencil className="mr-2 h-4 w-4" />Editar
                            </Link>
                          </DropdownMenuItem>
                          {u.id !== user?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(u)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{search ? "No se encontraron usuarios con ese criterio." : "No hay usuarios registrados."}</p>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a{" "}
              <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>? Esta acción no se puede deshacer y el usuario perderá acceso inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
