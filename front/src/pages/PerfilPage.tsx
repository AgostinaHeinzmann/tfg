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

import { getUserItineraries, deleteItineraryFromProfile, getItineraryDays } from "../services/itinerarioService"
import { getUserEvents, unregisterUserFromEvent, deleteEvent } from "../services/eventService"
import { showToast } from "../lib/toast-utils"
import { loadFromLocalStorage, saveToLocalStorage } from "../lib/utils"
import { updateUserProfile, uploadProfileImage } from "../services/authService"
import { Loader2 } from "lucide-react"
import EventoDetalleModal from "./EventoDetallePage"
import { getVerificacion } from "../services/verificacionService"
import ItinerarioResultadoPage from "./ItinerarioResultadoPage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog"

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
    name: "",
    email: "",
    joinDate: "",
    avatar: "",
    photoURL: "",
    displayName: ""
  })
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSurname, setEditSurname] = useState("")
  const [itineraries, setItineraries] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [showItineraryModal, setShowItineraryModal] = useState<{ open: boolean; itinerary: any | null }>({ open: false, itinerary: null })
  const [showEventModal, setShowEventModal] = useState<{ open: boolean; event: any | null }>({ open: false, event: null })
  const [loadingItineraryDetails, setLoadingItineraryDetails] = useState(false)
  const [deleteEventDialog, setDeleteEventDialog] = useState<{ open: boolean; eventId: number | null; eventTitle: string }>({ open: false, eventId: null, eventTitle: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)


  // Cargar datos del perfil
  useEffect(() => {
    const loadProfileData = async () => {

      setLoading(true)

      try {
        // Cargar datos de usuario desde localStorage
        const userLocal = loadFromLocalStorage("userData")
        console.log("User data loaded from localStorage:", userLocal)
        let userId = null;

        if (!userLocal) {
        navigate("/login")
        return
      }

        if (userLocal) {
          // Calcular fecha de registro real si existe
          let joinDate = "" // fallback
          if (userLocal.fecha_registro || userLocal.createdAt || userLocal.created_at) {
            const regDate = new Date(userLocal.fecha_registro || userLocal.createdAt || userLocal.created_at)
            if (!isNaN(regDate.getTime())) {
              joinDate = regDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
              // Capitalizar primera letra
              joinDate = joinDate.charAt(0).toUpperCase() + joinDate.slice(1)
            }
          }
          setUserData((prev) => ({ ...prev, ...userLocal, joinDate }))
          const nameParts = (userLocal.name || userLocal.displayName || userData.displayName).split(" ")
          setEditName(nameParts[0] || "")
          setEditSurname(nameParts.slice(1).join(" ") || "")
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
          // Transformar los datos del backend al formato esperado por el componente
          // Los datos vienen anidados: item.itinerario contiene la info real
          const transformedItineraries = (itinerariesResponse.data || []).map((item: any) => {
            const it = item.itinerario || item // El itinerario está anidado
            return {
              id: it.itinerario_id || item.itinerario_id || item.id,
              destination: it.ciudad?.nombre || it.mensaje || 'Destino',
              days: it.duracion ? parseInt(it.duracion) : 0,
              date: it.fecha_viaje ? new Date(it.fecha_viaje).toLocaleDateString('es-ES') : '',
              image: it.imagen || it.itinerariosDia?.[0]?.imagen || '/placeholder.svg',
              interests: it.intereses 
                ? it.intereses.split(',').map((i: string) => i.trim()) 
                : [],
              intereses: it.intereses,
              mensaje: it.mensaje,
              ciudad_nombre: it.ciudad?.nombre,
              duracion: it.duracion,
              itinerariosDia: it.itinerariosDia || [],
              // Mantener referencia al itinerario original
              _original: it
            }
          })
          setItineraries(transformedItineraries)
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
    setEditProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const fullName = `${editName} ${editSurname}`.trim()
      
      // Intentar guardar en backend
      try {
        await updateUserProfile({
          nombre: editName,
          apellido: editSurname,
        })
      } catch (backendError: any) {
        console.warn('Backend update failed, saving locally:', backendError)
        // Continuar con guardado local aunque falle el backend
      }
      
      // Actualizar estado local
      setUserData((prev) => ({ ...prev, displayName: fullName }))
      
      // Guardar en localStorage
      const userLocal = loadFromLocalStorage("userData")
      if (userLocal) {
        const updatedUser = {
          ...userLocal,
          displayName: fullName,
          nombre: editName,
          apellido: editSurname
        }
        saveToLocalStorage("userData", updatedUser)
        // Notificar al Navbar que se actualizaron los datos del usuario
        window.dispatchEvent(new Event('userDataUpdated'))
      }
      
      setEditProfileOpen(false)
      showToast.success("Perfil actualizado", "Los cambios se han guardado correctamente")
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast.error("Error", "No se pudieron guardar los cambios")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showToast.error("Error", "Por favor selecciona una imagen")
      return
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Error", "La imagen no puede superar los 5MB")
      return
    }
    
    setUploadingImage(true)
    try {
      // Intentar subir al backend
      let imageUrl = ''
      try {
        const response: any = await uploadProfileImage(file)
        imageUrl = response.imageUrl || response.imagen_url || response.url || ''
      } catch (backendError: any) {
        console.warn('Backend upload failed, using local preview:', backendError)
        // Usar URL local si falla el backend
        imageUrl = URL.createObjectURL(file)
      }
      
      if (imageUrl) {
        // Actualizar estado local
        setUserData((prev) => ({ ...prev, photoURL: imageUrl, avatar: imageUrl }))
        
        // Guardar en localStorage
        const userLocal = loadFromLocalStorage("userData")
        if (userLocal) {
          const updatedUser = {
            ...userLocal,
            photoURL: imageUrl,
            avatar: imageUrl,
            imagen_perfil: imageUrl
          }
          saveToLocalStorage("userData", updatedUser)
          // Notificar al Navbar que se actualizó la foto
          window.dispatchEvent(new Event('userDataUpdated'))
        }
        
        showToast.success("Foto actualizada", "Tu foto de perfil se ha cambiado")
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      showToast.error("Error", "No se pudo subir la foto")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteItinerary = async (itinerarioId: number) => {
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

  // Función para abrir el modal de itinerario con los días cargados
  const handleViewItinerary = async (itinerary: any) => {
    try {
      setLoadingItineraryDetails(true)
      
      // Obtener coordenadas de la ciudad del itinerario
      const cityName = itinerary.ciudad_nombre || itinerary.destination || ''
      
      // Los días ya vienen en itinerariosDia desde la carga inicial
      const daysData = itinerary.itinerariosDia || []
      
      // Si no hay días precargados, intentar cargarlos del backend
      let finalDaysData = daysData
      if (daysData.length === 0) {
        try {
          const itinerarioId = itinerary.id || itinerary.itinerario_id
          const response: any = await getItineraryDays(itinerarioId)
          finalDaysData = response.data || []
        } catch (e) {
          console.error('Error loading days from API:', e)
        }
      }
      
      // Agrupar actividades por día
      const dayMap = new Map<number, any[]>()
      finalDaysData.forEach((item: any) => {
        const dayMatch = item.nombre?.match(/Día\s*(\d+)/i)
        const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1
        
        const direccionObj = item.direccion
        const addressString = direccionObj && typeof direccionObj === 'object'
          ? `${direccionObj.calle || ''} ${direccionObj.numero || ''}`.trim()
          : (typeof item.direccion === 'string' ? item.direccion : '')
        
        
        
        const activity = {
          id: item.itinerario_por_dia_id?.toString() || item.id?.toString(),
          title: item.nombre?.replace(/Día\s*\d+:\s*/i, '') || item.nombre || 'Actividad',
          description: item.descripcion || '',
          location: item.direccion_nombre || item.nombre?.replace(/Día\s*\d+:\s*/i, '') || '',
          address: item.direccion_completa || addressString || '',
          time: item.hora || '09:00',
          duration: item.duracion || '2 horas',
          price: item.precio || null,
          ticketUrl: item.enlace_oficial || item.ticketUrl,
          imageUrl: item.imagen || '/placeholder.svg',
          rating: item.rating || 4.5,
          type: (item.tipo || 'atracción') as "museo" | "atracción" | "transporte" | "descanso"
        }
        
        if (!dayMap.has(dayNumber)) {
          dayMap.set(dayNumber, [])
        }
        dayMap.get(dayNumber)!.push(activity)
      })
      
      const days = Array.from(dayMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([dayNumber, activities]) => ({
          day: dayNumber,
          activities
        }))
      
      // Transformar el itinerario al formato esperado por ItinerarioResultadoPage
      const itineraryWithDays = {
        id: itinerary.id || itinerary.itinerario_id,
        destination: itinerary.destination || itinerary.ciudad_nombre || itinerary.mensaje || 'Destino',
        duration: itinerary.days || (itinerary.duracion ? parseInt(itinerary.duracion) : 0),
        interests: itinerary.interests || (itinerary.intereses ? itinerary.intereses.split(',').map((i: string) => i.trim()) : []),
        coverImage: itinerary.image || itinerary.imagen || finalDaysData[0]?.imagen || '/placeholder.svg',
        days,
      }
      
      setShowItineraryModal({ open: true, itinerary: itineraryWithDays })
    } catch (error) {
      console.error('Error loading itinerary days:', error)
      // Si falla, mostrar el itinerario sin días
      const cityName = itinerary.ciudad_nombre || itinerary.destination || ''
      const basicItinerary = {
        id: itinerary.id || itinerary.itinerario_id,
        destination: itinerary.destination || itinerary.ciudad_nombre || 'Destino',
        duration: itinerary.days || 0,
        interests: itinerary.interests || [],
        coverImage: itinerary.image || itinerary.imagen || '/placeholder.svg',
        days: [],
      }
      setShowItineraryModal({ open: true, itinerary: basicItinerary })
    } finally {
      setLoadingItineraryDetails(false)
    }
  }

  const handleUnregisterFromEvent = async (eventId: number) => {
    try {
      await unregisterUserFromEvent(eventId)
      setEvents(events.filter(e => e.id !== eventId))
      showToast.success("Te has dado de baja", "Ya no participas en este evento")
    } catch (error: any) {
      showToast.error("Error", error.response?.data?.message || "No se pudo cancelar la inscripción")
    }
  }

  const handleDeleteEventConfirm = (eventId: number, eventTitle: string) => {
    setDeleteEventDialog({ open: true, eventId, eventTitle })
  }

  const handleDeleteEvent = async () => {
    if (!deleteEventDialog.eventId) return

    try {
      await deleteEvent(deleteEventDialog.eventId)
      setEvents(events.filter(e => e.id !== deleteEventDialog.eventId))
      showToast.success("Evento eliminado", "El evento se eliminó correctamente")
      setDeleteEventDialog({ open: false, eventId: null, eventTitle: '' })
    } catch (error: any) {
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
                      placeholder="Nombre"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
                    <input
                      type="text"
                      value={editSurname}
                      onChange={e => setEditSurname(e.target.value)}
                      placeholder="Apellido"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditProfileOpen(false)} disabled={savingProfile}>Cancelar</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
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
                    <AvatarImage src={userData.photoURL || userData.avatar || "/placeholder.svg"} alt={userData.displayName} />
                    <AvatarFallback className="text-2xl bg-indigo-200 text-indigo-800">
                      {userData.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="profile-photo-input"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadPhoto}
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="profile-photo-input"
                    className={`absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-700 cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>
                </div>
                <CardTitle className="text-xl text-indigo-900">{userData.displayName}</CardTitle>
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
                      {itineraries.map((itinerary, index) => (
                        <Card
                          key={itinerary.id || `itinerary-${index}`}
                          className="overflow-hidden border-indigo-100 hover:shadow-md transition-shadow"
                        >
                          <div className="h-40 overflow-hidden">
                            <img
                              src={itinerary.image || "/placeholder.svg"}
                              alt={itinerary.mensaje || itinerary.destination}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg text-indigo-900 mb-2">{itinerary.mensaje || itinerary.destination}</h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                              <Clock className="h-4 w-4" />
                              <span>{itinerary.days} días</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() => handleViewItinerary(itinerary)}
                                disabled={loadingItineraryDetails}
                              >
                                {loadingItineraryDetails ? (
                                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cargando...</>
                                ) : (
                                  <><Eye className="h-4 w-4 mr-2" />Ver</>
                                )}
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
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/buscar-itinerario')}>Buscar itinerarios</Button>
                      </CardContent>
                    </Card>
                  )}
                  {/* Modal itinerario */}
                  <Dialog open={showItineraryModal.open} onOpenChange={(open) => !open && setShowItineraryModal({ open: false, itinerary: null })}>
                    <DialogContent className="max-w-3xl p-0">
                      <div className="max-h-[80vh] overflow-y-auto px-4 py-6">
                        {showItineraryModal.itinerary && (
                          <ItinerarioResultadoPage
                            itinerary={showItineraryModal.itinerary}
                            onClose={() => setShowItineraryModal({ open: false, itinerary: null })}
                            hideModifyButton={true}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
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
                                    onClick={() => handleDeleteEventConfirm(event.id, event.title)}
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

                  {/* Modal confirmar eliminación de evento */}
                  <Dialog open={deleteEventDialog.open} onOpenChange={(open) => !open && setDeleteEventDialog({ open: false, eventId: null, eventTitle: '' })}>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                          <Trash2 className="h-5 w-5" />
                          Eliminar evento
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Esta acción no se puede deshacer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-gray-700">
                          ¿Estás seguro de que quieres eliminar <span className="font-semibold">"{deleteEventDialog.eventTitle}"</span>?
                        </p>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteEventDialog({ open: false, eventId: null, eventTitle: '' })}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteEvent}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar evento
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
