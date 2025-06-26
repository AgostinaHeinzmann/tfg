import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import {
  Mail,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Edit,
  LogOut,
  Camera,
  Shield,
} from "lucide-react"

const PerfilPage: React.FC = () => {
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)

  // Datos de ejemplo
  const userData = {
    name: "María García",
    email: "maria@example.com",
    location: "Barcelona, España",
    joinDate: "Mayo 2023",
    avatar: "/placeholder.svg?height=100&width=100",
  }

  const itineraries = [
    {
      id: 1,
      destination: "Barcelona, España",
      days: 5,
      date: "15-20 Mayo, 2023",
      image: "/imagenes/barcelona.webp?height=200&width=300",
    },
    {
      id: 2,
      destination: "Roma, Italia",
      days: 4,
      date: "10-14 Junio, 2023",
      image: "/imagenes/roma.jpg?height=200&width=300",
    },
  ]

  const events = [
    {
      id: 1,
      title: "Tour gastronómico por Barcelona",
      location: "Barcelona, España",
      date: "15 de mayo, 2023",
      time: "18:00 - 21:00",
      image: "/imagenes/barcelonarestos.jpg?height=200&width=300",
    },
    {
      id: 2,
      title: "Visita guiada a la Sagrada Familia",
      location: "Barcelona, España",
      date: "17 de mayo, 2023",
      time: "10:00 - 12:00",
      image: "/imagenes/sagradafamilia.jpeg?height=200&width=300",
    },
  ]

  const handleVerifyIdentity = () => {
    navigate("/verificar-identidad")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Perfil del usuario */}
          <div className="md:col-span-1">
            <Card className="border-indigo-100 shadow-md sticky top-24">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4 w-24 h-24">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-indigo-200 text-indigo-800">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-700">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <CardTitle className="text-xl text-indigo-900">{userData.name}</CardTitle>
                <div className="flex justify-center mt-2">
                  {isVerified ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Identidad verificada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 text-amber-700 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Identidad sin verificar
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>Miembro desde {userData.joinDate}</span>
                </div>

                {!isVerified && (
                  <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={handleVerifyIdentity}>
                    <Shield className="h-4 w-4 mr-2" />
                    Verificar identidad
                  </Button>
                )}

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <Button variant="outline" className="w-full justify-start text-gray-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar perfil
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-gray-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-2">
            <Tabs defaultValue="itinerarios" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="itinerarios">Mis itinerarios</TabsTrigger>
                <TabsTrigger value="eventos">Mis eventos</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerarios">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-indigo-900">Mis itinerarios</h2>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Crear nuevo itinerario</Button>
                  </div>

                  {itineraries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {itineraries.map((itinerary) => (
                        <Card
                          key={itinerary.id}
                          className="overflow-hidden border-indigo-100 hover:shadow-md transition-shadow"
                        >
                          <div className="h-40 overflow-hidden">
                            <img
                              src={itinerary.image || "/placeholder.svg"}
                              alt={itinerary.destination}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg text-indigo-900 mb-2">{itinerary.destination}</h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <Clock className="h-4 w-4" />
                              <span>{itinerary.days} días</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                              <Calendar className="h-4 w-4" />
                              <span>{itinerary.date}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button variant="outline" className="flex-1 border-red-200 text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-indigo-100 bg-indigo-50/50">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="bg-indigo-100 p-3 rounded-full mb-4">
                          <MapPin className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-medium text-indigo-900 mb-2">No tienes itinerarios guardados</h3>
                        <p className="text-gray-600 mb-6 text-center max-w-md">
                          Crea tu primer itinerario personalizado para planificar tu próxima aventura
                        </p>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Crear itinerario</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="eventos">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-indigo-900">Mis eventos</h2>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => navigate("/crear-evento")}
                      disabled={!isVerified}
                    >
                      Crear nuevo evento
                    </Button>
                  </div>

                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {events.map((event) => (
                        <Card
                          key={event.id}
                          className="overflow-hidden border-indigo-100 hover:shadow-md transition-shadow"
                        >
                          <div className="h-40 overflow-hidden">
                            <img
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg text-indigo-900 mb-2">{event.title}</h3>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-600" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-indigo-600" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() => navigate(`/eventos/chat/${event.id}`)}
                              >
                                Chat
                              </Button>
                              <Button variant="outline" className="flex-1 border-red-200 text-red-700 hover:bg-red-50">
                                Cancelar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-indigo-100 bg-indigo-50/50">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="bg-indigo-100 p-3 rounded-full mb-4">
                          <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-medium text-indigo-900 mb-2">No tienes eventos reservados</h3>
                        <p className="text-gray-600 mb-6 text-center max-w-md">
                          Únete a eventos para conectar con otros viajeros y vivir experiencias únicas
                        </p>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/eventos")}>
                          Explorar eventos
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerfilPage
