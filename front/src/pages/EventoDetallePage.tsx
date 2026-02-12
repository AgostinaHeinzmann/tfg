import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { MapPin, Calendar, Clock, Users, CheckCircle, Loader2 } from "lucide-react"
import { Map } from "../components/map"
import { showToast } from "../lib/toast-utils"
import { loadFromLocalStorage } from "../lib/utils"
import { getEventById, registerUserToEvent } from "../services/eventService"
import { auth } from "../../firebase/firebase.config"

// Función para obtener las coordenadas del evento desde diferentes ubicaciones posibles
const getEventCoordinates = (event: any): [number, number] | null => {
  // Intentar obtener coordenadas directamente del evento
  if (event?.latitud != null && event?.longitud != null) {
    const lat = typeof event.latitud === 'string' ? parseFloat(event.latitud) : event.latitud
    const lon = typeof event.longitud === 'string' ? parseFloat(event.longitud) : event.longitud
    if (!isNaN(lat) && !isNaN(lon)) {
      return [lat, lon]
    }
  }
  // Intentar desde direccion
  if (event?.direccion?.latitud != null && event?.direccion?.longitud != null) {
    const lat = typeof event.direccion.latitud === 'string' ? parseFloat(event.direccion.latitud) : event.direccion.latitud
    const lon = typeof event.direccion.longitud === 'string' ? parseFloat(event.direccion.longitud) : event.direccion.longitud
    if (!isNaN(lat) && !isNaN(lon)) {
      return [lat, lon]
    }
  }
  // Fallback a coordinates si existe
  if (event?.coordinates && Array.isArray(event.coordinates) && event.coordinates.length === 2) {
    const lat = typeof event.coordinates[0] === 'string' ? parseFloat(event.coordinates[0]) : event.coordinates[0]
    const lon = typeof event.coordinates[1] === 'string' ? parseFloat(event.coordinates[1]) : event.coordinates[1]
    if (!isNaN(lat) && !isNaN(lon)) {
      return [lat, lon]
    }
  }
  // No hay coordenadas válidas
  return null
}

// Función para geocodificar una dirección
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || address.length < 3) return null
  
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    const data = await res.json()
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)
      if (!isNaN(lat) && !isNaN(lon)) {
        return [lat, lon]
      }
    }
  } catch (err) {
    console.error("Error geocoding address:", err)
  }
  return null
}

// Función para formatear la hora correctamente
const formatTime = (time: string | undefined): string => {
  if (!time) return ""
  
  // Si ya está en formato HH:mm, devolverlo
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time
  }
  
  // Si viene en formato HH:mm:ss, quitar los segundos
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time.substring(0, 5)
  }
  
  // Si es una fecha ISO, extraer la hora
  try {
    const date = new Date(time)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  } catch {
    // Ignorar error
  }
  
  return time
}

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
  const [isJoining, setIsJoining] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState<[number, number]>([41.3851, 2.1734])
  
  // Verificar si el usuario actual es el anfitrión/creador del evento
  const userData = loadFromLocalStorage("userData")
  const currentUserId = userData?.usuario_id
  const isHost = currentUserId && (event?.usuario_id === currentUserId || event?.creador_id === currentUserId)
  
  // Verificar si el usuario ya está inscrito
  const checkIsJoined = (eventData: any) => {
    if (!currentUserId) return false
    if (eventData?.usuario_inscrito || eventData?.esta_inscrito || eventData?.isJoined) return true
    // Verificar en inscripciones (como viene del backend)
    if (eventData?.inscripciones && Array.isArray(eventData.inscripciones)) {
      return eventData.inscripciones.some((ins: any) => ins.usuario_id === currentUserId)
    }
    if (eventData?.participantes && Array.isArray(eventData.participantes)) {
      return eventData.participantes.some((p: any) => p.usuario_id === currentUserId || p.id === currentUserId)
    }
    if (eventData?.usuarios_eventos && Array.isArray(eventData.usuarios_eventos)) {
      return eventData.usuarios_eventos.some((ue: any) => ue.usuario_id === currentUserId)
    }
    return false
  }
  
  const [isJoined, setIsJoined] = useState(() => checkIsJoined(initialEvent))

  // Cargar detalles completos del evento y geocodificar si es necesario
  useEffect(() => {
    const loadEventDetails = async () => {
      if (!open || !initialEvent?.evento_id) return

      setLoading(true)
      try {
        const response: any = await getEventById(initialEvent.evento_id)
        if (response.success && response.data) {
          const eventData = response.data
          setEvent(eventData)
          
          // Actualizar estado de inscripción desde los datos del evento
          if (checkIsJoined(eventData)) {
            setIsJoined(true)
          }
          
          // Intentar obtener coordenadas del evento
          const coords = getEventCoordinates(eventData)
          if (coords) {
            setMapCoordinates(coords)
          } else {
            // Si no hay coordenadas, intentar geocodificar la dirección
            const address = eventData?.direccion?.calle || eventData?.calle || eventData?.location
            if (address) {
              const geocodedCoords = await geocodeAddress(address)
              if (geocodedCoords) {
                setMapCoordinates(geocodedCoords)
              }
            }
          }
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
          <div className="flex gap-2 flex-wrap">
            {isHost && (
              <Badge className="bg-indigo-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Anfitrión
                </span>
              </Badge>
            )}
            {isJoined && !isHost && (
              <Badge className="bg-green-600 text-white">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Inscrito
                </span>
              </Badge>
            )}
            {(event?.categoria || event?.category || event?.interes?.tipo || event?.intereses) && (
              <Badge className="bg-indigo-100 text-indigo-800">
                {event?.categoria || event?.category || event?.interes?.tipo || (Array.isArray(event?.intereses) && event?.intereses[0]?.tipo ? event?.intereses[0].tipo : (typeof event?.intereses === 'string' ? event?.intereses : ''))}
              </Badge>
            )}
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
              <span>{formatTime(event?.horario || event?.time)}</span>
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
              center={mapCoordinates}
              zoom={16}
              height="200px"
              address={event?.direccion?.calle || event?.calle || event?.location}
              title={event?.nombre_evento || event?.title}
              showGoogleMapsButton={true}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className={`${isHost ? 'w-full' : 'flex-1'} bg-transparent`} onClick={handleClose}>
              Volver
            </Button>
            {!isHost && !autoJoin && !isJoined && (
              <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700" 
                onClick={handleJoinEvent}
                disabled={isJoining}
              >
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isJoining ? "Uniéndose..." : "Unirse al evento"}
              </Button>
            )}
            {!isHost && isJoined && (
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
