import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  MapPin,
  Calendar,
  Bookmark,
  Share2,
  Download,
  ExternalLink,
  Info,
  Star,
  Coffee,
  Utensils,
  Bus,
  Train,
  Loader2,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import Map from "../components/map"
import { saveItineraryToProfile } from "../services/itinerarioService"
import { showToast } from "../lib/toast-utils"
import { loadFromLocalStorage } from "../lib/utils"

// Tipos para las actividades
type Activity = {
  id: string
  title: string
  description: string
  location: string
  address: string
  coordinates: [number, number]
  time: string
  duration: string
  price: number | null
  ticketUrl?: string
  imageUrl: string
  rating: number
  type: "museo" | "atracción" | "transporte" | "descanso"
}

type ItineraryDay = {
  day: number
  activities: Activity[]
}

type ItinerarioResultadoPageProps = {
  open?: boolean
  itinerary?: any
  onClose?: () => void
  isFromPopular?: boolean
  hideModifyButton?: boolean
}

const ItinerarioResultadoPage: React.FC<ItinerarioResultadoPageProps> = ({ itinerary, onClose, isFromPopular = false, hideModifyButton = false }) => {

  const navigate = useNavigate()
  // Si viene desde el perfil (hideModifyButton=true), ya está guardado
  const [isSaved, setIsSaved] = useState(hideModifyButton)
  const [isSaving, setIsSaving] = useState(false)

  // Datos del itinerario recibido por props
  const itineraryData = itinerary || null

  // Función para renderizar el icono según el tipo de actividad
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "museo":
        return <Utensils className="h-4 w-4" />
      case "atracción":
        return <Star className="h-4 w-4" />
      case "transporte":
        return <Bus className="h-4 w-4" />
      case "descanso":
        return <Coffee className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const handleSaveItinerary = async () => {
    if (isSaved) {
      showToast.info("Ya guardado", "Este itinerario ya está en tu perfil")
      return
    }

    try {
      setIsSaving(true)
      const userLocal = loadFromLocalStorage("userData")
      
      if (!userLocal || !userLocal.usuario_id) {
        showToast.warning("Inicia sesión", "Necesitas iniciar sesión para guardar itinerarios")
        navigate("/login")
        return
      }

      const itinerarioId = itinerary.id || itinerary.itinerario_id
      await saveItineraryToProfile(itinerarioId, userLocal.usuario_id)
      
      setIsSaved(true)
      showToast.success("Itinerario guardado", "El itinerario se guardó en tu perfil")
    } catch (error: any) {
      console.error("Error saving itinerary:", error)
      if (error.response?.status === 409) {
        setIsSaved(true)
        showToast.info("Ya guardado", "Este itinerario ya está en tu perfil")
      } else {
        showToast.error("Error", error.response?.data?.message || "No se pudo guardar el itinerario")
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!itinerary) {
    return <div className="p-8 text-center text-gray-500">No hay datos de itinerario.</div>
  }

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto max-w-5xl py-6 px-4">

        {/* Encabezado del itinerario */}
        <div className="relative rounded-xl overflow-hidden h-[250px] mb-6">
          <img
            src={itineraryData.coverImage || "/placeholder.svg"}
            alt={itineraryData.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex gap-2 mb-2">
              {itineraryData.interests.map((interest: string, index: number) => (
                <Badge key={index} className="bg-indigo-600">
                  {interest}
                </Badge>
              ))}
              <Badge className="bg-white/90 text-indigo-800">{itineraryData.duration} días</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">Itinerario para {itineraryData.destination}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{itineraryData.duration} días</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del itinerario */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={isSaved ? "default" : "outline"}
            className={isSaved ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            onClick={handleSaveItinerary}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Guardado" : "Guardar itinerario"}
          </Button>
        </div>

        {/* Resumen del itinerario */}
        <Card className="border-indigo-100 shadow-md mb-8">
          <CardHeader>
            <CardTitle>Resumen del itinerario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Este itinerario de {itineraryData.duration} días en {itineraryData.destination} está enfocado en{" "}
              <strong>{itineraryData.interests.join(", ")}</strong> con un presupuesto{" "}
              ciudad, con tiempo para disfrutar de la gastronomía local.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                  Duración
                </h3>
                <p className="text-gray-700">{itineraryData.duration} días completos</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-indigo-600" />
                  Enfoque principal
                </h3>
                <p className="text-gray-700">{itineraryData.interests.join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista por día */}
        {Array.isArray(itineraryData.days) && itineraryData.days.length > 0 ? (
          <Accordion type="single" collapsible defaultValue="day-1" className="mb-8">
            {itineraryData.days.map((day: ItineraryDay) => (
              <AccordionItem key={`day-${day.day}`} value={`day-${day.day}`}>
                <AccordionTrigger className="hover:bg-indigo-50 px-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      {day.day}
                    </div>
                    <span className="font-medium">Día {day.day}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-6 pt-2 pb-4">
                    {day.activities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="relative pl-8 border-l-2 border-indigo-200 pb-6 last:border-l-0 last:pb-0"
                      >
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-600"></div>
                        <div className="mb-2 flex items-center">
                          <span className="text-sm text-gray-500 mr-3">{activity.time}</span>
                          <Badge
                            className={`${
                              activity.type === "museo"
                                  ? "bg-orange-100 text-orange-800"
                                  : activity.type === "atracción"
                                    ? "bg-purple-100 text-purple-800"
                                    : activity.type === "transporte"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-green-100 text-green-800"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {getActivityIcon(activity.type)}
                              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                            </span>
                          </Badge>
                        </div>

                        <Card className="border-indigo-100">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="md:w-1/4">
                                <div className="rounded-md overflow-hidden h-32">
                                  <img
                                    src={activity.imageUrl || "/placeholder.svg"}
                                    alt={activity.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="md:w-3/4">
                                <h3 className="font-bold text-lg text-indigo-900 mb-1">{activity.title}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span className="ml-1 text-sm">{activity.rating}</span>
                                  </div>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">{activity.duration}</span>
                                  <span className="text-sm text-gray-500">•</span>
                                </div>
                                <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium">{activity.location}</p>
                                      <p className="text-xs text-gray-500">{activity.address}</p>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <Map
                                      center={activity.coordinates}
                                      zoom={16}
                                      height="150px"
                                      address={activity.address}
                                      title={activity.title}
                                      showGoogleMapsButton={false}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="p-8 text-center text-gray-500">Este itinerario no tiene actividades detalladas.</div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3 justify-end">
          {!isFromPopular && !hideModifyButton && onClose && (
            <Button
              variant="ghost"
              className="mb-6 text-indigo-700"
              onClick={onClose}
            >
              Modificar búsqueda
            </Button>
          )}
          {!hideModifyButton && (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleSaveItinerary}
              disabled={isSaving || isSaved}
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
              ) : isSaved ? (
                <><Bookmark className="h-4 w-4 mr-2 fill-current" />Guardado en mi perfil</>
              ) : (
                <><Bookmark className="h-4 w-4 mr-2" />Guardar en mi perfil</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItinerarioResultadoPage
