import type React from "react"
import { useState, useEffect } from "react"
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
  UserMinus,
} from "lucide-react"

import { getUserItineraries, deleteItineraryFromProfile } from "../services/itinerarioService"
import { getUserEvents, unregisterUserFromEvent, deleteEvent } from "../services/eventService"
import { auth } from "../../firebase/firebase.config"
import { showToast } from "../lib/toast-utils"
import { loadFromLocalStorage } from "../lib/utils"
import { Loader2 } from "lucide-react"
import EventoDetalleModal from "./EventoDetallePage"
import { getVerificacion } from "../services/verificacionService"

// Función para formatear la hora correctamente
const formatTime = (time: string | undefined): string => {
  if (!time) return "Sin horario"
  
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

const PerfilPage: React.FC = () => {
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: "Agostina Heinzmann",
    email: "agos.heinzmann@gmail.com",
    location: "Córdoba, Argentina",
    joinDate: "Junio 2025",
    avatar: "/imagenes/image.png?height=100&width=100",
    photoURL: ""
  })
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSurname, setEditSurname] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [itineraries, setItineraries] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [showItineraryModal, setShowItineraryModal] = useState<{ open: boolean; itinerary: any | null }>({ open: false, itinerary: null })
  const [showEventModal, setShowEventModal] = useState<{ open: boolean; event: any | null }>({ open: false, event: null })

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfileData = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate("/login")
        return
      }

      setLoading(true)

      try {
        // Cargar datos de usuario desde localStorage
        const userLocal = loadFromLocalStorage("userData")
        let userId = null;

        if (userLocal) {
          setUserData((prev) => ({ ...prev, ...userLocal }))
          const nameParts = (userLocal.name || userLocal.displayName || userData.name).split(" ")
          setEditName(nameParts[0] || "")
          setEditSurname(nameParts.slice(1).join(" ") || "")
          setEditLocation(userLocal.location || userData.location)
          userId = userLocal.usuario_id;
        }

        if (!userId) {
          console.error("User ID not found in local storage");
          return;
        }

        // Cargar estado de verificación
        try {
          const verificacion = await getVerificacion()
          setIsVerified(verificacion)
        } catch (error: any) {
          console.error("Error loading verification status:", error)
          setIsVerified(false)
        }

        // Cargar itinerarios guardados
        try {
          const itinerariesResponse: any = await getUserItineraries(userId)
          setItineraries(itinerariesResponse.data || [])
        } catch (error: any) {
          console.error("Error loading itineraries:", error)
        }

        // Cargar eventos del usuario (eventos donde está registrado)
        try {
          const eventsResponse: any = await getUserEvents(userId)
          setEvents(eventsResponse || [])
        } catch (error: any) {
          console.error("Error loading events:", error)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const handleVerifyIdentity = () => {
    navigate("/verificar-identidad")
  }

  const handleEditProfile = () => {
    const nameParts = userData.name.split(" ")
    setEditName(nameParts[0] || "")
    setEditSurname(nameParts.slice(1).join(" ") || "")
    setEditLocation(userData.location)
    setEditProfileOpen(true)
  }

  const handleSaveProfile = () => {
    const fullName = `${editName} ${editSurname}`.trim()
    setUserData((prev) => ({ ...prev, name: fullName, location: editLocation }))
    setEditProfileOpen(false)
    // TODO: Guardar en backend
  }

  const handleDeleteItinerary = async (itinerarioId: number) => {
    const user = auth.currentUser
    if (!user) return

    try {
      const userLocal = loadFromLocalStorage("userData")
      if (!userLocal || !userLocal.usuario_id) return

      await deleteItineraryFromProfile(userLocal.usuario_id, itinerarioId)
      setItineraries(itineraries.filter(it => it.id !== itinerarioId))
      showToast.success("Itinerario eliminado", "El itinerario se eliminó de tu perfil")
    } catch (error: any) {
      console.error("Error deleting itinerary:", error)
      showToast.error("Error", error.message || "No se pudo eliminar el itinerario")
    }
  }

  const handleUnregisterFromEvent = async (eventId: number) => {
    try {
      await unregisterUserFromEvent(eventId)
      setEvents(events.filter(e => e.id !== eventId))
      showToast.success("Te has dado de baja", "Ya no participas en este evento")
    } catch (error: any) {
      console.error("Error unregistering from event:", error)
      showToast.error("Error", error.response?.data?.message || "No se pudo cancelar la inscripción")
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await deleteEvent(eventId)
      setEvents(events.filter(e => e.id !== eventId))
      showToast.success("Evento eliminado", "El evento se eliminó correctamente")
    } catch (error: any) {
      console.error("Error deleting event:", error)
      showToast.error("Error", error.response?.data?.message || "No se pudo eliminar el evento")
    }
  }

  const reloadEvents = async () => {
    const userLocal = loadFromLocalStorage("userData")
    if (!userLocal?.usuario_id) return
    
    try {
      const eventsResponse: any = await getUserEvents(userLocal.usuario_id)
      setEvents(eventsResponse || [])
    } catch (error) {
      console.error("Error reloading events:", error)
    }
  }


  const handleLogout = () => {
    localStorage.removeItem("userData")
    navigate("/login")
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Modal editar perfil */}
        {editProfileOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-indigo-900">Editar perfil</h2>
                <p className="text-sm text-gray-500 mt-1">Actualiza tu información personal</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
                    <input
                      type="text"
                      value={editSurname}
                      onChange={e => setEditSurname(e.target.value)}
                      placeholder="Tu apellido"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubicación</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      placeholder="Ciudad, País"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancelar</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveProfile}>Guardar cambios</Button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Perfil del usuario */}
          <div className="md:col-span-1">
            <Card className="border-indigo-100 shadow-md sticky top-24">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4 w-24 h-24">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    <AvatarImage src={userData.photoURL || userData.avatar || "/placeholder.svg"} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-indigo-200 text-indigo-800">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-700" onClick={handleEditProfile}>
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
                  <Button variant="outline" className="w-full justify-start text-gray-700" onClick={handleEditProfile}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar perfil
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-gray-700" onClick={handleLogout}>
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
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/buscar-itinerario')}>Buscar itinerarios</Button>
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
                                onClick={() => setShowItineraryModal({ open: true, itinerary })}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteItinerary(itinerary.id)}
                              >
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
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Buscar itinerarios</Button>
                      </CardContent>
                    </Card>
                  )}
                  {/* Modal itinerario */}
                  {showItineraryModal.open && (
                    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
                        {/* Aquí se puede importar y mostrar ItinerarioResultadoPage */}
                        <h2 className="text-xl font-bold mb-4">Detalle del itinerario</h2>
                        {/* Reemplazar por <ItinerarioResultadoPage itinerary={showItineraryModal.itinerary} onClose={() => setShowItineraryModal({ open: false, itinerary: null })} /> */}
                        <Button className="mt-4" onClick={() => setShowItineraryModal({ open: false, itinerary: null })}>Cerrar</Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="eventos">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-indigo-900">Mis eventos</h2>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/eventos')}>Buscar eventos</Button>
                  </div>

                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {events.map((event) => (
                        <Card
                          key={event.id}
                          className="overflow-hidden border-indigo-100 hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge className={event.isOwner ? "bg-indigo-600" : "bg-green-600"}>
                                {event.role}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg text-indigo-900 mb-2">{event.title}</h3>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                <span>{event.location || 'Sin ubicación'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-600" />
                                <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Sin fecha'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-indigo-600" />
                                <span>{formatTime(event.time)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <span>{event.participants}/{event.maxParticipants || '∞'} participantes</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() => setShowEventModal({ open: true, event })}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              {event.isOwner ? (
                                <>
                                  <Button 
                                    variant="outline" 
                                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                    onClick={() => navigate(`/editar-evento/${event.id}`)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => handleUnregisterFromEvent(event.id)}
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Darme de baja
                                </Button>
                              )}
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
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/eventos")}>Buscar eventos</Button>
                      </CardContent>
                    </Card>
                  )}
                  {/* Modal evento */}
                  {showEventModal.open && showEventModal.event && (
                    <EventoDetalleModal 
                      event={{
                        evento_id: showEventModal.event.id,
                        nombre_evento: showEventModal.event.title,
                        descripcion_evento: showEventModal.event.description,
                        imagen: showEventModal.event.image,
                        fecha_inicio: showEventModal.event.date,
                        horario: showEventModal.event.time,
                        calle: showEventModal.event.location,
                        participantes_actuales: showEventModal.event.participants,
                        cant_participantes: showEventModal.event.maxParticipants,
                        restriccion_edad: showEventModal.event.restriccion_edad,
                        usuario_id: showEventModal.event.usuario_id
                      }}
                      open={showEventModal.open}
                      onClose={() => setShowEventModal({ open: false, event: null })}
                      onEventUpdate={reloadEvents}
                    />
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
