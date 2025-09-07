import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Globe, Calendar, MessageCircle, Shield, LogIn, UserPlus, MapPin, Users, Router, Camera, Trees } from "lucide-react"

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50">
      {/* Hero Section */}
      <div className="bg-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Explora, Conecta, Viaja</h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Descubre destinos increíbles, busca itinerarios personalizados y conecta con otros viajeros
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-indigo-500 text-indigo-indigo hover:bg-indigo-indigoHover" onClick={() => navigate("/login")}>
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar sesión
              </Button>
              <Button
                size="lg"
                className="bg-indigo-500 text-indigo-indigo hover:bg-indigo-indigoHover"
                onClick={() => navigate("/registro")}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indigo-900 mb-4">Todo lo que necesitas para tu próxima aventura</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre todas las herramientas y funciones que te ayudarán a planificar el viaje perfecto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Itinerarios Personalizados */}
            <Card className="border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <Trees className="h-6 w-6 text-indigo-600" /> {/* Cambiado el icono */}
                </div>
                <CardTitle>Itinerarios Personalizados</CardTitle>
                <CardDescription>Busca itinerarios basados en tus intereses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Busca itinerarios basados en tus intereses, destino y fechas de viaje para aprovechar al máximo tu
                  experiencia.
                </p>
              </CardContent>
            </Card>

            {/* Eventos Exclusivos */}
            <Card className="border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Eventos Exclusivos</CardTitle>
                <CardDescription>Descubre y únete a eventos oficiales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Descubre y únete a eventos oficiales o creados por otros viajeros que comparten tus intereses.
                </p>
              </CardContent>
            </Card>

            {/* Sistema de Seguridad */}
            <Card className="border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Sistema de Seguridad</CardTitle>
                <CardDescription>Verificación de identidad para eventos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Sistema de escaneo de DNI y validación de edad para garantizar la seguridad al inscribirse en eventos
                  con restricciones.
                </p>
              </CardContent>
            </Card>

            {/* Comunidad de Viajeros */}
            <Card className="border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Comunidad de Viajeros</CardTitle>
                <CardDescription>Conecta con otros viajeros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Conecta con otros viajeros, comparte experiencias y haz nuevas amistades durante tus aventuras.
                </p>
              </CardContent>
            </Card>

            {/* Chat por Evento */}
            <Card className="border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <MessageCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Chat por Evento</CardTitle>
                <CardDescription>Coordina detalles con otros participantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Coordina detalles con otros participantes a través de nuestro chat interno asociado a cada evento.
                </p>
              </CardContent>
            </Card>

            {/* Feed de Experiencias */}
            <Card className="border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <Camera className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Feed de Experiencias</CardTitle>
                <CardDescription>Comparte fotos y experiencias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  Comparte fotos, opiniones y consejos en nuestro feed geolocalizado y descubre las experiencias de
                  otros viajeros.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
