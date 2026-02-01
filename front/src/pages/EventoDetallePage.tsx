import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { MapPin, Calendar, Clock, Users, CheckCircle, Loader2 } from "lucide-react"
import { Map } from "../components/map"
import { showToast } from "../lib/toast-utils"
import { getEventById, registerUserToEvent } from "../services/eventService"
import { auth } from "../../firebase/firebase.config"

interface EventoDetalleModalProps {
  event: any
  open: boolean
  onClose: () => void
  autoJoin?: boolean
  onEventUpdate?: () => void
}

const EventoDetalleModal: React.FC<EventoDetalleModalProps> = ({ event: initialEvent, open, onClose, autoJoin, onEventUpdate }) => {
  const navigate = useNavigate()
  const [event, setEvent] = useState(initialEvent)
  const [loading, setLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  // Cargar detalles completos del evento
  useEffect(() => {
    const loadEventDetails = async () => {
      if (!open || !initialEvent?.evento_id) return

      setLoading(true)
      try {
        const response: any = await getEventById(initialEvent.evento_id)
        if (response.success && response.data) {
          setEvent(response.data)
        }
      } catch (error) {
        console.error("Error loading event details:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEventDetails()
  }, [open, initialEvent?.evento_id])

  const handleJoinEvent = async () => {
    const user = auth.currentUser
    if (!user) {
      showToast.warning("Inicia sesión", "Debes iniciar sesión para unirte")
      navigate("/login")
      return
    }

    setIsJoining(true)
    try {
      await registerUserToEvent(event.evento_id)
      showToast.success("¡Te has unido al evento!", "Tu inscripción fue exitosa")
      setIsJoined(true)

      // Recargar detalles del evento
      const response: any = await getEventById(event.evento_id)
      if (response.success && response.data) {
        setEvent(response.data)
      }
      
      // Notificar al componente padre para actualizar la lista
      if (onEventUpdate) {
        onEventUpdate()
      }
    } catch (error: any) {
      console.error("Error joining event:", error)
      
      const errorCode = error.response?.data?.errorCode
      const errorMessage = error.response?.data?.message || error.message || "No se pudo completar la inscripción"
      
      if (errorCode === "VERIFICATION_REQUIRED") {
        showToast.warning("Verificación requerida", errorMessage)
        navigate("/verificar-identidad")
      } else if (errorCode === "AGE_RESTRICTION") {
        showToast.error("Restricción de edad", errorMessage)
      } else if (errorCode === "EVENT_FULL") {
        showToast.error("Evento lleno", errorMessage)
      } else {
        showToast.error("Error", errorMessage)
      }
    } finally {
      setIsJoining(false)
    }
  }

  useEffect(() => {
    if (open && autoJoin) {
      handleJoinEvent()
    }
  }, [open, autoJoin])

  const handleClose = () => {
    onClose()
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={v => !v && handleClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?.nombre_evento || event?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-md overflow-hidden">
            <img 
              src={
                event?.imagen_base64 
                  ? `data:${event?.imagen_mime_type || 'image/jpeg'};base64,${event?.imagen_base64}`
                  : (event?.imagen || event?.image || "/placeholder.svg")
              } 
              alt={event?.nombre_evento || event?.title} 
              className="w-full h-48 object-cover" 
            />
          </div>
          <div className="flex gap-2">
            <Badge className={`${event?.isOfficial ? "bg-indigo-600" : "bg-orange-500"}`}>
              {event?.isOfficial ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Oficial
                </span>
              ) : (
                "Usuario"
              )}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">{event?.categoria || event?.category}</Badge>
            {(event?.restriccion_edad || event?.ageRestriction) && <Badge className="bg-amber-500">+{event?.restriccion_edad || event?.minAge || 18}</Badge>}
          </div>

          <p className="text-gray-700">{event?.descripcion_evento || event?.description}</p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>{event?.direccion?.calle || event?.calle || event?.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>{new Date(event?.fecha_inicio || event?.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>{event?.horario || event?.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>
                {event?.participantes_actuales || event?.participants || 0}/{event?.cant_participantes || event?.maxParticipants} participantes
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Map
              center={event?.coordinates || [41.3851, 2.1734]}
              zoom={16}
              height="200px"
              address={event?.direccion?.calle || event?.location}
              title={event?.nombre_evento || event?.title}
              showGoogleMapsButton={true}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClose}>
              Volver
            </Button>
            {!autoJoin && !isJoined && (
              <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700" 
                onClick={handleJoinEvent}
                disabled={isJoining}
              >
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isJoining ? "Uniéndose..." : "Unirse al evento"}
              </Button>
            )}
            {isJoined && (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                disabled
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Ya estás inscrito
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventoDetalleModal
