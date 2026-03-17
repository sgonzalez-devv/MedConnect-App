"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <span className="text-white text-2xl font-semibold">MedConnect</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight text-balance">
            Gestiona tu consultorio de forma inteligente
          </h1>
          <p className="text-teal-100 text-lg">
            Citas, pacientes y comunicaciones en un solo lugar. Con inteligencia artificial para automatizar tu día a día.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-teal-200 text-sm">Médicos activos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50k+</p>
              <p className="text-teal-200 text-sm">Citas gestionadas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-teal-200 text-sm">Satisfacción</p>
            </div>
          </div>
        </div>

        <p className="text-teal-200 text-sm">
          © 2024 MedConnect. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <span className="text-foreground text-2xl font-semibold">MedConnect</span>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@ejemplo.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, rememberMe: checked as boolean })
                      }
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    href="#"
                    className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/onboarding" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                    Regístrate aquí
                  </Link>
                </p>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-6 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="font-medium">Demo:</span> Ingresa cualquier email y contraseña para acceder
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
