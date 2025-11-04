import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { MapPin, Calendar, Clock, Users, CheckCircle, MessageCircle, Share2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Map } from "../components/map"


import { useEffect } from "react"
import { showToast } from "../lib/toast-utils"

const EventoDetalleModal: React.FC<{ event: any; open: boolean; onClose: () => void; autoJoin?: boolean }> = ({ event, open, onClose, autoJoin }) => {
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)
  const [joinStatus, setJoinStatus] = useState<"success" | "error" | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const handleJoinEvent = () => {
    // Simulación de verificación de requisitos
    if (event.ageRestriction && !isVerified) {
      showToast.warning(
        "Verificación requerida",
        `Este evento tiene restricción de edad (+${event.minAge}). Debes verificar tu identidad para poder unirte.`
      )
      navigate("/verificar-identidad")
    } else {
      showToast.success(
        "¡Te has unido al evento!",
        "Tu inscripción fue exitosa."
      )
      setIsJoined(true)
    }
  }

  useEffect(() => {
    if (open && autoJoin) {
      handleJoinEvent()
    }
    // eslint-disable-next-line
  }, [open, autoJoin])

  const handleVerifyIdentity = () => {
    navigate("/verificar-identidad")
    onClose()
  }

  const handleClose = () => {
    setShowVerificationAlert(false)
    setJoinStatus(null)
    setShowParticipants(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-md overflow-hidden">
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
          </div>
          <div className="flex gap-2">
            <Badge className={`${event.isOfficial ? "bg-indigo-600" : "bg-orange-500"}`}>
              {event.isOfficial ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Oficial
                </span>
              ) : (
                "Usuario"
              )}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">{event.category}</Badge>
            {event.ageRestriction && <Badge className="bg-amber-500">+{event.minAge}</Badge>}
          </div>

          {/* El feedback ahora se da solo por toast, no por alertas internas */}

          <p className="text-gray-700">{event.description}</p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>
                {event.participants}/{event.maxParticipants} participantes
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Map
              center={event.coordinates || [41.3851, 2.1734]}
              zoom={16}
              height="200px"
              address={event.location}
              title={event.title}
              showGoogleMapsButton={true}
            />
          </div>

          <div className="pt-2">
            <Card className="border-indigo-100 shadow-md">
              <CardHeader>
                <CardTitle>Anfitrión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.host?.avatar || "/placeholder.svg"} alt={event.host?.name} />
                    <AvatarFallback className="bg-indigo-200 text-indigo-800">
                      {event.host?.name?.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{event.host?.name}</h3>
                      {event.host?.verified && (
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

          <div className="pt-2">
            <Card className="border-indigo-100 shadow-md">
              <CardHeader>
                <CardTitle>Participantes ({event.participants})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(event.attendees || []).slice(0, 6).map((attendee: any, index: number) => (
                    <Avatar key={index} className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                      <AvatarFallback className="bg-indigo-200 text-indigo-800 text-xs">
                        {attendee.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {event.participants > 6 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium">
                      +{event.participants - 6}
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full text-sm bg-transparent" onClick={() => setShowParticipants(true)}>
                  Ver todos los participantes
                </Button>
                {showParticipants && (
                  <Dialog open={showParticipants} onOpenChange={v => !v && setShowParticipants(false)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Participantes</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                        {(event.attendees || []).map((attendee: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <Avatar>
                              <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                              <AvatarFallback className="bg-indigo-200 text-indigo-800">
                                {attendee.name.split(" ").map((n: string) => n[0]).join("")}
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
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClose}>
              Volver
            </Button>
            {!autoJoin && (
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleJoinEvent}>
                Unirse al evento
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventoDetalleModal
