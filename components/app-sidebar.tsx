"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Stethoscope,
  Building2,
  BarChart2,
  UserCog,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useClinicContext } from "@/hooks/use-clinic-context"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-indigo-600",
    bgActive: "bg-indigo-50",
    description: "Vista general y resumen del día",
  },
  {
    title: "Clínicas",
    href: "/clinics",
    icon: Building2,
    color: "text-teal-600",
    bgActive: "bg-teal-50",
    description: "Gestiona tus clínicas",
  },
  {
    title: "Calendario",
    href: "/calendario",
    icon: Calendar,
    color: "text-blue-600",
    bgActive: "bg-blue-50",
    description: "Gestiona todas tus citas",
  },
  {
    title: "Pacientes",
    href: "/pacientes",
    icon: Users,
    color: "text-teal-600",
    bgActive: "bg-teal-50",
    description: "Lista de pacientes registrados",
  },
  {
    title: "Bot WhatsApp",
    href: "/bot-whatsapp",
    icon: MessageSquare,
    color: "text-green-600",
    bgActive: "bg-green-50",
    description: "Conversaciones con pacientes",
  },
]

const secondaryNavItems = [
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
    color: "text-gray-600",
    bgActive: "bg-gray-50",
    description: "Ajustes de la cuenta y notificaciones",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { setTheme } = useTheme()
  const { clinics, currentClinic, currentClinicId, setCurrentClinicId } = useClinicContext()

  const displayName = user?.full_name || user?.email || "Usuario"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const isPediatrics = user?.profession === "Pediatría"
  const isAdmin = user?.user_role === "admin"

  async function handleLogout() {
    await signOut()
    router.push("/login")
  }

  return (
    <TooltipProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sidebar-foreground text-base">MedConnect</span>
              <span className="text-xs text-muted-foreground">Centro de Control</span>
            </div>
          </div>

          {/* Active clinic indicator */}
          {currentClinic && (
            <div className="px-2 pb-3">
              {clinics.length > 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-left">
                      <Building2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="text-xs font-medium text-teal-700 dark:text-teal-300 truncate flex-1">
                        {currentClinic.name}
                      </span>
                      <ChevronDown className="h-3 w-3 text-teal-500 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                      Cambiar clínica
                    </div>
                    <DropdownMenuSeparator />
                    {clinics.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => setCurrentClinicId(c.id)}
                        className={c.id === currentClinicId ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" : ""}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800">
                  <Building2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300 truncate">
                    {currentClinic.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
              Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`transition-all duration-200 ${
                              isActive
                                ? `${item.bgActive} border-l-4 border-l-teal-500`
                                : "hover:bg-teal-50/50 border-l-4 border-l-transparent"
                            }`}
                          >
                            <Link href={item.href}>
                              <item.icon className={`${item.color} ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                              <span className={isActive ? "font-medium" : ""}>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  )
                })}

                {isPediatrics && (
                  <SidebarMenuItem key="/percentiles">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/percentiles" || pathname.startsWith("/percentiles/")}
                          className={`transition-all duration-200 ${
                            pathname === "/percentiles" || pathname.startsWith("/percentiles/")
                              ? "bg-pink-50 border-l-4 border-l-teal-500"
                              : "hover:bg-teal-50/50 border-l-4 border-l-transparent"
                          }`}
                        >
                          <Link href="/percentiles">
                            <BarChart2 className="text-pink-600 transition-transform duration-200" />
                            <span>Percentiles</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium">Percentiles</p>
                        <p className="text-xs text-muted-foreground">Curvas de crecimiento pediátrico (OMS)</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
                Administración
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem key="/admin/doctores">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/admin/doctores" || pathname.startsWith("/admin/doctores/")}
                          className={`transition-all duration-200 ${
                            pathname === "/admin/doctores" || pathname.startsWith("/admin/doctores/")
                              ? "bg-violet-50 border-l-4 border-l-teal-500"
                              : "hover:bg-teal-50/50 border-l-4 border-l-transparent"
                          }`}
                        >
                          <Link href="/admin/doctores">
                            <UserCog className="text-violet-600" />
                            <span>Gestión de Doctores</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium">Gestión de Doctores</p>
                        <p className="text-xs text-muted-foreground">Crear y gestionar cuentas de doctores</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`transition-all duration-200 ${
                              isActive
                                ? `${item.bgActive} border-l-4 border-l-teal-500`
                                : "hover:bg-teal-50/50 border-l-4 border-l-transparent"
                            }`}
                          >
                            <Link href={item.href}>
                              <item.icon className={`${item.color} ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                              <span className={isActive ? "font-medium" : ""}>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="h-auto py-3 hover:bg-teal-50/50 transition-all duration-200">
                        <Avatar className="h-9 w-9 ring-2 ring-teal-100">
                          <AvatarFallback className="bg-linear-to-br from-teal-100 to-teal-200 text-teal-700 text-xs font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium text-sidebar-foreground truncate max-w-30">
                            {displayName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-30">
                            {user?.profession || user?.user_role || ""}
                          </span>
                        </div>
                        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Opciones de cuenta</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    Modo Claro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    Modo Oscuro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                    <Monitor className="mr-2 h-4 w-4" />
                    Automático
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/configuracion">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
