import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Globe, Mail, Lock } from "lucide-react";
import { showToast } from "../lib/toast-utils";
import { logIn, logInwithGoogle } from "@/services/auth";
import { syncUserBackend } from "@/services/authService";
import { saveToLocalStorage } from "@/lib/utils";

export const AUTH_ERROR_CODE = "auth/invalid-credential"

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [credentialError, setCredentialError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setCredentialError(""); // <-- limpiar antes de enviar
    const result = await logIn({ email, password });
    console.log(result);

    if (result?.token) {
      try {
        // Sincronizar con backend para obtener usuario_id
        // No enviar nombre/apellido por defecto para no sobrescribir datos existentes
        const backendUser = await syncUserBackend({
          email: result.email || email,
          uid: result.uid,
          nombre: result.displayName?.split(' ')[0] || undefined,
          apellido: result.displayName?.split(' ').slice(1).join(' ') || undefined,
          imagen_perfil: result.photoURL || undefined
        }) as { user: Record<string, unknown> }

        // Guardar datos combinados
        const userData = {
          ...result,
          ...backendUser.user // Incluye usuario_id
        }

        saveToLocalStorage("userData", userData)
        // Notificar al Navbar que se actualizaron los datos del usuario
        window.dispatchEvent(new Event('userDataUpdated'))
        showToast.success("Inicio de sesión exitoso", "Bienvenido de vuelta");
        navigate("/experiencias");
      } catch (error) {
        console.error("Error syncing user:", error)
        showToast.error("Error de sincronización", "No se pudo conectar con el servidor")
      }
    } else if (
      result?.code === AUTH_ERROR_CODE
    ) {
      setCredentialError("Mail o contraseña incorrecta. Intente de nuevo.");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await logInwithGoogle();
    if (result?.token) {
      try {
        // Sincronizar con backend para obtener usuario_id
        const backendUser = await syncUserBackend({
          email: result.email || '',
          uid: result.uid,
          nombre: result.displayName?.split(' ')[0] || undefined,
          apellido: result.displayName?.split(' ').slice(1).join(' ') || undefined,
          imagen_perfil: result.photoURL || undefined
        }) as { user: Record<string, unknown> }

        // Guardar datos combinados
        const userData = {
          ...result,
          ...backendUser.user // Incluye usuario_id
        }

        saveToLocalStorage("userData", userData)
        // Notificar al Navbar que se actualizaron los datos del usuario
        window.dispatchEvent(new Event('userDataUpdated'))
        showToast.success("Inicio de sesión con Google exitoso");
        navigate("/experiencias");
      } catch (error) {
        console.error("Error syncing user:", error)
        showToast.error("Error de sincronización", "No se pudo conectar con el servidor")
      }
    } else {
      showToast.error(
        "Error al iniciar sesión con Google",
        result?.message || "Intenta nuevamente"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-16 px-4">
      <div className="container mx-auto max-w-md">
        <Card className="border-indigo-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-indigo-100 p-3 rounded-full w-fit">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl text-indigo-900">
              Iniciar sesión
            </CardTitle>
            <CardDescription>
              Accede a tu cuenta para continuar tu aventura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className={`pl-10 ${emailError ? "border-red-500" : ""}`}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-600 text-sm mt-1">{emailError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <Link
                        to="/recuperar-password"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${passwordError ? "border-red-500" : ""}`}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError("");
                        }}
                        required
                      />
                    </div>
                    {passwordError && (
                      <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                    )}
                  </div>
                  {credentialError && (
                    <p className="text-red-600 text-sm mt-1 text-center">{credentialError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Iniciar sesión
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="google">
                <div className="text-center py-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
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
                    Continuar con Google
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-indigo-100 pt-4">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className="text-indigo-600 hover:underline font-medium"
              >
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
