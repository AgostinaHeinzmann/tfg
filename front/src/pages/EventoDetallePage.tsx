import type React from "react"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  MessageCircle,
  Share2,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

const EventoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isJoined, setIsJoined] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)

  // Datos de ejemplo del evento
  const event = {
    id: id,
    title: "Tour gastronómico por Barcelona",
    description:
      "Descubre los sabores auténticos de Barcelona en este recorrido por los mejores bares de tapas y restaurantes locales. Probaremos una variedad de platos tradicionales catalanes mientras aprendemos sobre la historia culinaria de la región. El tour incluye 5 paradas con degustaciones en cada una. ¡Ven con hambre y sed de conocimiento!",
    location: "Plaza Catalunya, Barcelona, España",
    date: "15 de mayo, 2023",
    time: "18:00 - 21:00",
    participants: 12,
    maxParticipants: 15,
    image: "/placeholder.svg?height=400&width=800",
    isOfficial: true,
    category: "Gastronomía",
    ageRestriction: true,
    minAge: 18,
    host: {
      name: "Carlos Rodríguez",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    attendees: [
      { name: "María G.", avatar: "/placeholder.svg?height=40&width=40" },
      { name: "Juan P.", avatar: "/placeholder.svg?height=40&width=40" },
      { name: "Ana S.", avatar: "/placeholder.svg?height=40&width=40" },
      { name: "Luis M.", avatar: "/placeholder.svg?height=40&width=40" },
      { name: "Elena R.", avatar: "/placeholder.svg?height=40&width=40" },
      { name: "Pablo D.", avatar: "/placeholder.svg?height=40&width=40" },
      { name: "Laura T.", avatar: "/placeholder.svg?height=40&width=40" },
    ],
  }

  const handleJoinEvent = () => {
    if (event.ageRestriction && !isVerified) {
      setShowVerificationAlert(true)
    } else {
      setIsJoined(true)
      // Aquí iría la lógica para unirse al evento
    }
  }

  const handleVerifyIdentity = () => {
    navigate("/verificar-identidad")
  }

  const handleGoToChat = () => {
    navigate(`/eventos/chat/${event.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" className="mb-6 text-teal-700" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a eventos
        </Button>

        {/* Imagen de portada */}
        <div className="relative rounded-xl overflow-hidden h-[300px] mb-6">
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex gap-2 mb-2">
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
              <Badge className="bg-white/90 text-teal-800">{event.category}</Badge>
              {event.ageRestriction && <Badge className="bg-amber-500">+{event.minAge}</Badge>}
            </div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>
        </div>

        {showVerificationAlert && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verificación requerida</AlertTitle>
            <AlertDescription>
              Este evento tiene restricción de edad (+{event.minAge}). Debes verificar tu identidad para poder unirte.
              <Button
                variant="outline"
                className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={handleVerifyIdentity}
              >
                Verificar ahora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Detalles del evento */}
          <div className="md:col-span-2">
            <Card className="border-teal-100 shadow-md mb-6">
              <CardHeader>
                <CardTitle>Detalles del evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">{event.description}</p>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Ubicación</h3>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Fecha y hora</h3>
                      <p className="text-gray-600">
                        {event.date}, {event.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Participantes</h3>
                      <p className="text-gray-600">
                        {event.participants}/{event.maxParticipants} personas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3">Mapa</h3>
                  <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Mapa interactivo</p>
                      <p className="text-sm">(Integración con Google Maps)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-100 shadow-md">
              <CardHeader>
                <CardTitle>Anfitrión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.host.avatar || "/placeholder.svg"} alt={event.host.name} />
                    <AvatarFallback className="bg-teal-200 text-teal-800">
                      {event.host.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{event.host.name}</h3>
                      {event.host.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">Anfitrión del evento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="border-teal-100 shadow-md sticky top-24">
              <CardContent className="pt-6 space-y-6">
                {isJoined ? (
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">¡Te has unido al evento!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Puedes acceder al chat del evento para coordinar con otros participantes.
                    </p>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 mb-3" onClick={handleGoToChat}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ir al chat
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => setIsJoined(false)}
                    >
                      Cancelar participación
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleJoinEvent}>
                    Unirse al evento
                  </Button>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Participantes ({event.participants})</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.attendees.slice(0, 6).map((attendee, index) => (
                      <Avatar key={index} className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                        <AvatarFallback className="bg-teal-200 text-teal-800 text-xs">
                          {attendee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {event.participants > 6 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium">
                        +{event.participants - 6}
                      </div>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-sm">
                        Ver todos los participantes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Participantes</DialogTitle>
                        <DialogDescription>Personas que se han unido a este evento</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                        {[...event.attendees, ...event.attendees].map((attendee, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <Avatar>
                              <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                              <AvatarFallback className="bg-teal-200 text-teal-800">
                                {attendee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{attendee.name}</div>
                              <div className="text-sm text-gray-500">Participante</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventoDetallePage
