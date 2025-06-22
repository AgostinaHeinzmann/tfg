import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Globe, User, Calendar, MessageCircle, Shield, LogIn, UserPlus, MapPin, Users } from "lucide-react"

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Explora, Conecta, Viaja</h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              Descubre destinos increíbles, crea itinerarios personalizados y conecta con otros viajeros
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50" onClick={() => navigate("/login")}>
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar sesión
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-teal-700"
                onClick={() => navigate("/registro")}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-teal-900 mb-4">Explora todas las interfaces</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Navega por todas las pantallas de la plataforma sin necesidad de iniciar sesión o registrarte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Autenticación */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <LogIn className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Autenticación</CardTitle>
                <CardDescription>Pantallas de inicio de sesión y registro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Interfaces para iniciar sesión con email o Google, y registrarse como nuevo usuario
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                  Iniciar sesión
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/registro")}>
                  Registro
                </Button>
              </CardFooter>
            </Card>

            {/* Perfil de Usuario */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <User className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Perfil de Usuario</CardTitle>
                <CardDescription>Información personal y contenido guardado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Visualiza datos personales, itinerarios guardados y eventos a los que te has unido
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/perfil")}>
                  Ver perfil
                </Button>
              </CardFooter>
            </Card>

            {/* Eventos */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Eventos</CardTitle>
                <CardDescription>Explora y crea eventos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Descubre eventos creados por otros viajeros o crea los tuyos propios
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => navigate("/eventos")}>
                  Explorar
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/crear-evento")}>
                  Crear
                </Button>
              </CardFooter>
            </Card>

            {/* Detalle de Evento */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Detalle de Evento</CardTitle>
                <CardDescription>Información completa de un evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Visualiza todos los detalles de un evento, incluyendo ubicación, participantes y descripción
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/eventos/1")}>
                  Ver ejemplo
                </Button>
              </CardFooter>
            </Card>

            {/* Chat de Evento */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <MessageCircle className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Chat de Evento</CardTitle>
                <CardDescription>Comunicación entre participantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Interfaz de chat para comunicarte con otros participantes de un evento
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/eventos/chat/1")}>
                  Ver chat
                </Button>
              </CardFooter>
            </Card>

            {/* Verificación de Identidad */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Verificación de Identidad</CardTitle>
                <CardDescription>Proceso de verificación de DNI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Verifica tu identidad para acceder a eventos con restricción de edad y crear tus propios eventos
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => navigate("/verificar-identidad")}
                >
                  Ver proceso
                </Button>
              </CardFooter>
            </Card>

            {/* Itinerario Resultado */}
            <Card className="border-teal-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Itinerario Generado</CardTitle>
                <CardDescription>Resultado de búsqueda de itinerario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Visualiza un itinerario detallado generado según tus preferencias de viaje
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => navigate("/itinerario/resultado")}
                >
                  Ver itinerario
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-teal-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-teal-900 mb-4">Características principales</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nuestra plataforma ofrece todo lo que necesitas para planificar tus viajes y conectar con otros viajeros
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-teal-900 mb-2">Itinerarios personalizados</h3>
                <p className="text-gray-600">
                  Crea itinerarios detallados para tus viajes con recomendaciones personalizadas
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-teal-900 mb-2">Eventos sociales</h3>
                <p className="text-gray-600">Únete a eventos organizados por otros viajeros o crea los tuyos propios</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-teal-900 mb-2">Comunidad verificada</h3>
                <p className="text-gray-600">
                  Sistema de verificación de identidad para garantizar la seguridad de todos los usuarios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-teal-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <Globe className="h-8 w-8 mr-2" />
                <span className="text-2xl font-bold">TravelSocial</span>
              </div>
              <div className="flex gap-6">
                <Link to="#" className="hover:text-teal-300">
                  Acerca de
                </Link>
                <Link to="#" className="hover:text-teal-300">
                  Términos
                </Link>
                <Link to="#" className="hover:text-teal-300">
                  Privacidad
                </Link>
                <Link to="#" className="hover:text-teal-300">
                  Contacto
                </Link>
              </div>
            </div>
            <div className="border-t border-teal-800 mt-8 pt-8 text-center text-teal-400 text-sm">
              © 2023 TravelSocial. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
