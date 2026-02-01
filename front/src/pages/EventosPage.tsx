import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Calendar, MapPin, Clock, Users, Plus, CheckCircle, Eye, Loader2 } from "lucide-react"
import EventoDetalleModal from "./EventoDetallePage"
import { showToast } from "../lib/toast-utils"
import { getAllEvents, registerUserToEvent, type EventFilters } from "../services/eventService"
import { getFilters } from "../services/filtrosService"
import { auth } from "../../firebase/firebase.config"

const EventosPage: React.FC = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<EventFilters>({})
  const [filterOptions, setFilterOptions] = useState<{
    intereses: Array<{ id: number; tipo: string }>
    ageGroups: Array<{ id: number; label: string }>
  }>({ intereses: [], ageGroups: [] })
  const [locationInput, setLocationInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Cargar filtros disponibles
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response: any = await getFilters()
        if (response.success && response.data) {
          setFilterOptions({
            intereses: response.data.intereses || [],
            ageGroups: response.data.ageGroups || []
          })
        }
      } catch (error) {
        console.error("Error loading filters:", error)
      }
    }
    loadFilters()
  }, [])

  // Cargar eventos
  const loadEvents = async () => {
    setLoading(true)
    try {
      const response: any = await getAllEvents(filters)
      setEvents(response.data || [])
    } catch (error: any) {
      console.error("Error loading events:", error)
      showToast.error("Error al cargar eventos", error.message || "No se pudieron cargar los eventos")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [filters])

  // Aplicar filtros
  const handleApplyFilters = () => {
    const newFilters: EventFilters = {}
    if (locationInput) newFilters.location = locationInput
    if (selectedCategory) newFilters.interests = selectedCategory
    if (selectedAgeGroup !== null) newFilters.ageGroup = selectedAgeGroup
    if (selectedDate) newFilters.date = selectedDate
    setFilters(newFilters)
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-indigo-900 mb-2">Eventos</h1>
              <p className="text-gray-600">Descubre eventos y actividades para conectar con otros viajeros</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/crear-evento")}>
              <Plus className="h-4 w-4 mr-2" />
              Crear evento
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Card className="border-indigo-100 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="font-medium">Ubicación</div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Ciudad o país"
                        className="pl-10"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Categoría</div>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.intereses.map((interes) => (
                        <Badge
                          key={interes.id}
                          className={`cursor-pointer ${selectedCategory === interes.tipo
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          onClick={() => setSelectedCategory(selectedCategory === interes.tipo ? null : interes.tipo)}
                        >
                          {interes.tipo}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Grupo de edad</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`cursor-pointer ${selectedAgeGroup === null
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        onClick={() => setSelectedAgeGroup(null)}
                      >
                        Todos
                      </Badge>
                      {filterOptions.ageGroups.map((group) => (
                        <Badge
                          key={group.id}
                          className={`cursor-pointer ${selectedAgeGroup === group.id
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          onClick={() => setSelectedAgeGroup(group.id)}
                        >
                          {group.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Fecha</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`cursor-pointer ${selectedDate === null
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        onClick={() => setSelectedDate(null)}
                      >
                        Todos
                      </Badge>
                      <Badge
                        className={`cursor-pointer ${selectedDate === 'today'
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        onClick={() => setSelectedDate('today')}
                      >
                        Hoy
                      </Badge>
                      <Badge
                        className={`cursor-pointer ${selectedDate === 'week'
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        onClick={() => setSelectedDate('week')}
                      >
                        Esta semana
                      </Badge>
                      <Badge
                        className={`cursor-pointer ${selectedDate === 'month'
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        onClick={() => setSelectedDate('month')}
                      >
                        Este mes
                      </Badge>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleApplyFilters}>Aplicar filtros</Button>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.evento_id} event={event} onEventUpdate={loadEvents} />
                  ))}
                </div>
              ) : (
                <Card className="border-indigo-100">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
                    <p className="text-gray-600 text-center">Intenta ajustar los filtros o crea un nuevo evento</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, onEventUpdate }: { event: any; onEventUpdate: () => void }) {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleJoin = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        showToast.warning("Inicia sesión", "Debes iniciar sesión para unirte a un evento")
        navigate("/login")
        return
      }

      setIsJoining(true)

      // Registrar usuario en el evento
      await registerUserToEvent(event.evento_id)
      showToast.success("¡Te has unido al evento!", "Tu inscripción fue exitosa.")
      onEventUpdate()
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
        showToast.error("Error al unirse", errorMessage)
      }
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-indigo-100 hover:shadow-md transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={
              event.imagen_base64 
                ? `data:${event.imagen_mime_type || 'image/jpeg'};base64,${event.imagen_base64}`
                : (event.imagen || event.image || "/placeholder.svg")
            } 
            alt={event.nombre_evento || event.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-3 right-3">
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
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-indigo-800">{event.categoria || event.category}</Badge>
          </div>
          {(event.restriccion_edad || event.ageRestriction) && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-amber-500">+{event.restriccion_edad || event.minAge || 18}</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-indigo-900 mb-2">{event.nombre_evento || event.title}</h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>{event.direccion?.calle || event.calle || event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>{event.fecha_inicio ? new Date(event.fecha_inicio).toLocaleDateString() : event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>{event.horario || event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>
                {event.participantes_actuales || event.participants}/{event.cant_participantes || event.maxParticipants} participantes
              </span>
            </div>
          </div>

          <div className="flex -space-x-2 mb-4">
            {[...Array(Math.min(4, event.participantes_actuales || event.participants || 0))].map((_, i) => (
              <Avatar key={i} className="border-2 border-white w-8 h-8">
                <AvatarFallback className="bg-indigo-200 text-indigo-800 text-xs">
                  {String.fromCharCode(65 + i)}
                </AvatarFallback>
              </Avatar>
            ))}
            {(event.participantes_actuales || event.participants || 0) > 4 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium">
                +{(event.participantes_actuales || event.participants) - 4}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={handleOpenModal}>
              <Eye className="h-4 w-4 mr-2" />
              Ver evento
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unirse"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <EventoDetalleModal 
        event={event} 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onEventUpdate={onEventUpdate}
      />
    </>
  )
}

export default EventosPage
