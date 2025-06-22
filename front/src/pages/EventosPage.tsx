import type React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Calendar, MapPin, Clock, Users, Plus, CheckCircle, Eye } from "lucide-react"
import EventModal from "../components/EventModal"

const EventosPage: React.FC = () => {
  const navigate = useNavigate()

  // Datos de ejemplo para eventos
  const events = [
    {
      id: "1",
      title: "Tour gastronómico por Barcelona",
      description:
        "Descubre los sabores auténticos de Barcelona en este recorrido por los mejores bares de tapas y restaurantes locales. Probaremos una variedad de platos tradicionales catalanes mientras aprendemos sobre la historia culinaria de la región.",
      location: "Barcelona, España",
      date: "15 de mayo, 2023",
      time: "18:00 - 21:00",
      participants: 12,
      maxParticipants: 15,
      image: "/placeholder.svg?height=200&width=300",
      isOfficial: true,
      category: "Gastronomía",
      ageRestriction: false,
    },
    {
      id: "2",
      title: "Senderismo en Montserrat",
      description:
        "Únete a nosotros para una aventura de senderismo en las impresionantes montañas de Montserrat. Disfrutaremos de vistas panorámicas, visitaremos el famoso monasterio y exploraremos los senderos naturales de esta maravilla geológica.",
      location: "Montserrat, España",
      date: "18 de mayo, 2023",
      time: "09:00 - 16:00",
      participants: 8,
      maxParticipants: 10,
      image: "/placeholder.svg?height=200&width=300",
      isOfficial: false,
      category: "Aventura",
      ageRestriction: false,
    },
    {
      id: "3",
      title: "Fiesta en la playa",
      description:
        "Celebra el verano con nosotros en esta fiesta en la playa de la Barceloneta. Habrá música, bebidas y la oportunidad de conocer a otros viajeros en un ambiente relajado frente al mar Mediterráneo.",
      location: "Barceloneta, Barcelona",
      date: "20 de mayo, 2023",
      time: "21:00 - 02:00",
      participants: 25,
      maxParticipants: 50,
      image: "/placeholder.svg?height=200&width=300",
      isOfficial: false,
      category: "Fiesta",
      ageRestriction: true,
      minAge: 21,
    },
    {
      id: "4",
      title: "Visita guiada a la Sagrada Familia",
      description:
        "Explora la obra maestra inacabada de Gaudí con un guía experto. Aprenderás sobre la historia, simbolismo y detalles arquitectónicos de este icónico templo, uno de los monumentos más visitados de España.",
      location: "Barcelona, España",
      date: "22 de mayo, 2023",
      time: "10:00 - 12:00",
      participants: 15,
      maxParticipants: 20,
      image: "/placeholder.svg?height=200&width=300",
      isOfficial: true,
      category: "Cultura",
      ageRestriction: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-teal-900 mb-2">Eventos</h1>
              <p className="text-gray-600">Descubre eventos y actividades para conectar con otros viajeros</p>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/crear-evento")}>
              <Plus className="h-4 w-4 mr-2" />
              Crear evento
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Card className="border-teal-100 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="font-medium">Ubicación</div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input placeholder="Ciudad o país" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Categoría</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="cursor-pointer bg-teal-600 hover:bg-teal-700">Todos</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Cultura</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Gastronomía</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Aventura</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Fiesta</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Grupo de edad</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="cursor-pointer bg-teal-600 hover:bg-teal-700">Todos</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">18-25</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">26-35</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">36-50</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">50+</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Fecha</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="cursor-pointer bg-teal-600 hover:bg-teal-700">Todos</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Hoy</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Esta semana</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Este mes</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Tipo</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="cursor-pointer bg-teal-600 hover:bg-teal-700">Todos</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Oficial</Badge>
                      <Badge className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200">Usuario</Badge>
                    </div>
                  </div>

                  <Button className="w-full">Aplicar filtros</Button>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="all" className="w-full mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="official">Oficiales</TabsTrigger>
                  <TabsTrigger value="user">Usuarios</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const navigate = useNavigate()

  return (
    <Card className="overflow-hidden border-teal-100 hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <Badge className={`${event.isOfficial ? "bg-teal-600" : "bg-orange-500"}`}>
            {event.isOfficial ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Oficial
              </span>
            ) : (
              "Usuario"
            )}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-teal-800">{event.category}</Badge>
        </div>
        {event.ageRestriction && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-amber-500">+{event.minAge}</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-teal-900 mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600" />
            <span>
              {event.participants}/{event.maxParticipants} participantes
            </span>
          </div>
        </div>

        <div className="flex -space-x-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <Avatar key={i} className="border-2 border-white w-8 h-8">
              <AvatarFallback className="bg-teal-200 text-teal-800 text-xs">
                {String.fromCharCode(65 + i)}
              </AvatarFallback>
            </Avatar>
          ))}
          {event.participants > 4 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium">
              +{event.participants - 4}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <EventModal event={event}>
            <Button variant="outline" className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50">
              <Eye className="h-4 w-4 mr-2" />
              Ver evento
            </Button>
          </EventModal>

          <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => navigate(`/eventos/${event.id}`)}>
            Unirse
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventosPage
