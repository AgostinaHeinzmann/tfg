import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Globe, Mail, Lock } from "lucide-react"
import { register as registerUser, logInwithGoogle } from "@/services/auth"
import { syncUserBackend } from "@/services/authService"
import { saveToLocalStorage } from "@/lib/utils"
import { showToast } from "../lib/toast-utils"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z
  .object({
    nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    email: z.email({ message: "Ingrese un correo válido" }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres alfanuméricos" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

const RegistroPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setError,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Validación manual en cada campo al escribir o dejar de escribir
  const handleBlur = async (field: keyof FormData) => {
    await trigger(field)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
      })
      setLoading(false)
      if (result?.token) {
        try {
          // Sincronizar con backend
          const backendUser = await syncUserBackend({
            email: result.email || data.email,
            uid: result.uid,
            nombre: data.nombre,
            apellido: data.apellido,
            imagen_perfil: result.photoURL ?? undefined
          }) as { user: Record<string, unknown> }

          // Guardar datos combinados con nombre completo
          const userData = {
            ...result,
            ...backendUser.user,
            name: `${data.nombre} ${data.apellido}`.trim(),
            displayName: `${data.nombre} ${data.apellido}`.trim()
          }

          saveToLocalStorage("userData", userData)
          // Notificar al Navbar que se actualizaron los datos del usuario
          window.dispatchEvent(new Event('userDataUpdated'))
          showToast.success("Registro exitoso", "¡Bienvenido!")
          navigate("/experiencias")
        } catch (error) {
          console.error("Error syncing user:", error)
          showToast.error("Error de sincronización", "No se pudo conectar con el servidor")
        }
      } else if (result?.code === "auth/email-already-in-use") {
        setError("email", { type: "manual", message: "Este correo ya está registrado" })
      } else {
        showToast.error("Ha ocurrido un error. Por favor, inténtelo más tarde")
      }
    } catch {
      setLoading(false)
      showToast.error("Ha ocurrido un error. Por favor, inténtelo más tarde")
    }
  }

  const handleGoogleRegister = async () => {
    setLoading(true)
    try {
      const result = await logInwithGoogle()
      setLoading(false)
      if (result?.token) {
        try {
          // Sincronizar con backend
          const backendUser = await syncUserBackend({
            email: result.email || '',
            uid: result.uid,
            nombre: result.displayName?.split(' ')[0] || 'Usuario',
            apellido: result.displayName?.split(' ').slice(1).join(' ') || '',
            imagen_perfil: result.photoURL ?? undefined
          }) as { user: Record<string, unknown> }

          // Guardar datos combinados
          const userData = {
            ...result,
            ...backendUser.user
          }

          saveToLocalStorage("userData", userData)
          // Notificar al Navbar que se actualizaron los datos del usuario
          window.dispatchEvent(new Event('userDataUpdated'))
          showToast.success("Registro con Google exitoso", "¡Bienvenido!")
          navigate("/experiencias")
        } catch (error) {
          console.error("Error syncing user:", error)
          showToast.error("Error de sincronización", "No se pudo conectar con el servidor")
        }
      } else {
        showToast.error("Ha ocurrido un error. Por favor, inténtelo más tarde")
      }
    } catch {
      setLoading(false)
      showToast.error("Ha ocurrido un error. Por favor, inténtelo más tarde")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-16 px-4">
      <div className="container mx-auto max-w-md">
        <Card className="border-indigo-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-indigo-100 p-3 rounded-full w-fit">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl text-indigo-900">Crear una cuenta</CardTitle>
            <CardDescription>Únete a nuestra comunidad de viajeros</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Nombre"
                        className={errors.nombre ? "border-red-500" : ""}
                        {...register("nombre", { onBlur: () => handleBlur("nombre") })}
                        autoComplete="given-name"
                      />
                      {touchedFields.nombre && errors.nombre && (
                        <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        type="text"
                        placeholder="Apellido"
                        className={errors.apellido ? "border-red-500" : ""}
                        {...register("apellido", { onBlur: () => handleBlur("apellido") })}
                        autoComplete="family-name"
                      />
                      {touchedFields.apellido && errors.apellido && (
                        <p className="text-red-600 text-sm mt-1">{errors.apellido.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        {...register("email", { onBlur: () => handleBlur("email") })}
                        autoComplete="email"
                      />
                    </div>
                    {touchedFields.email && errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                        {...register("password", { onBlur: () => handleBlur("password") })}
                        autoComplete="new-password"
                      />
                    </div>
                    {touchedFields.password && errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        {...register("confirmPassword", { onBlur: () => handleBlur("confirmPassword") })}
                        autoComplete="new-password"
                      />
                    </div>
                    {touchedFields.confirmPassword && errors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                  {/* Mensaje de campos vacíos al enviar */}
                  {Object.keys(errors).length > 0 && (
                    <p className="text-red-600 text-sm mt-2">Por favor, complete todos los campos</p>
                  )}
                </form>
              </TabsContent>
              <TabsContent value="google">
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-6">Regístrate rápidamente usando tu cuenta de Google</p>
                  <Button variant="outline" className="w-full" onClick={handleGoogleRegister} disabled={loading}>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Registrarse con Google
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-indigo-100 pt-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default RegistroPage
