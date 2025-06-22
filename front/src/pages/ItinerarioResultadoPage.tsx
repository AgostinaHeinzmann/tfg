"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  MapPin,
  Calendar,
  Euro,
  Bookmark,
  Share2,
  Download,
  ChevronLeft,
  ExternalLink,
  Info,
  Star,
  Coffee,
  Utensils,
  Bus,
  Train,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"

// Tipos para las actividades
type Activity = {
  id: string
  title: string
  description: string
  location: string
  address: string
  time: string
  duration: string
  price: number | null
  priceRange: "€" | "€€" | "€€€" | "€€€€" | "Gratis"
  ticketUrl?: string
  imageUrl: string
  rating: number
  type: "museo" | "atracción" | "comida" | "transporte" | "descanso"
}

type ItineraryDay = {
  day: number
  activities: Activity[]
}

const ItinerarioResultadoPage: React.FC = () => {
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)

  // Datos de ejemplo para el itinerario generado
  const itineraryData = {
    destination: "París, Francia",
    duration: 5,
    interests: ["Museos", "Arte", "Historia"],
    budget: "Moderado",
    totalCost: 450,
    currency: "EUR",
    coverImage: "/placeholder.svg?height=400&width=800",
    days: [
      {
        day: 1,
        activities: [
          {
            id: "1",
            title: "Museo del Louvre",
            description:
              "El museo de arte más grande del mundo y un monumento histórico en París. Hogar de miles de obras de arte, incluyendo la Mona Lisa y la Venus de Milo.",
            location: "Palais Royal, Musée du Louvre",
            address: "Rue de Rivoli, 75001 París, Francia",
            time: "09:00 - 12:30",
            duration: "3.5 horas",
            price: 17,
            priceRange: "€€" as const,
            ticketUrl: "https://www.louvre.fr/en/visit",
            imageUrl: "/placeholder.svg?height=200&width=300",
            rating: 4.8,
            type: "museo" as const,
          },
          {
            id: "2",
            title: "Almuerzo en Café Marly",
            description:
              "Restaurante elegante con vistas a la pirámide del Louvre. Ofrece cocina francesa contemporánea en un ambiente sofisticado.",
            location: "Café Marly",
            address: "93 Rue de Rivoli, 75001 París, Francia",
            time: "13:00 - 14:30",
            duration: "1.5 horas",
            price: 35,
            priceRange: "€€€" as const,
            ticketUrl: undefined,
            imageUrl: "/placeholder.svg?height=200&width=300",
            rating: 4.2,
            type: "comida" as const,
          },
          {
            id: "3",
            title: "Museo de Orsay",
            description:
              "Albergado en la antigua estación de Orsay, este museo contiene principalmente arte francés de 1848 a 1914, incluyendo obras maestras impresionistas y postimpresionistas.",
            location: "Musée d'Orsay",
            address: "1 Rue de la Légion d'Honneur, 75007 París, Francia",
            time: "15:00 - 18:00",
            duration: "3 horas",
            price: 16,
            priceRange: "€€" as const,
            ticketUrl: "https://www.musee-orsay.fr/en",
            imageUrl: "/placeholder.svg?height=200&width=300",
            rating: 4.7,
            type: "museo" as const,
          },
        ],
      },
      // Más días del itinerario...
    ] as ItineraryDay[],
  }

  // Función para renderizar el icono según el tipo de actividad
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "museo":
        return <Info className="h-4 w-4" />
      case "comida":
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

  // Función para renderizar el rango de precios
  const renderPriceRange = (priceRange: Activity["priceRange"]) => {
    if (priceRange === "Gratis") {
      return <span className="text-green-600 font-medium">Gratis</span>
    }

    const euros = priceRange.length
    const filledEuros = Array(euros).fill("€").join("")
    return <span className="text-gray-700">{filledEuros}</span>
  }

  // Calcular el costo total del itinerario
  const calculateTotalCost = () => {
    let total = 0
    itineraryData.days.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.price) {
          total += activity.price
        }
      })
    })
    return total
  }

  const handleSaveItinerary = () => {
    setIsSaved(!isSaved)
    // Aquí iría la lógica para guardar el itinerario
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <Button variant="ghost" className="mb-6 text-teal-700" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a búsqueda
        </Button>

        {/* Encabezado del itinerario */}
        <div className="relative rounded-xl overflow-hidden h-[300px] mb-6">
          <img
            src={itineraryData.coverImage || "/placeholder.svg"}
            alt={itineraryData.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex gap-2 mb-2">
              {itineraryData.interests.map((interest, index) => (
                <Badge key={index} className="bg-teal-600">
                  {interest}
                </Badge>
              ))}
              <Badge className="bg-white/90 text-teal-800">{itineraryData.duration} días</Badge>
              <Badge className="bg-amber-500">{itineraryData.budget}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">Itinerario para {itineraryData.destination}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{itineraryData.duration} días</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Euro className="h-4 w-4" />
                <span>
                  ~{calculateTotalCost()} {itineraryData.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del itinerario */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={isSaved ? "default" : "outline"}
            className={isSaved ? "bg-teal-600 hover:bg-teal-700" : ""}
            onClick={handleSaveItinerary}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Guardado" : "Guardar itinerario"}
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>

        {/* Resumen del itinerario */}
        <Card className="border-teal-100 shadow-md mb-8">
          <CardHeader>
            <CardTitle>Resumen del itinerario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Este itinerario de {itineraryData.duration} días en {itineraryData.destination} está enfocado en{" "}
              <strong>{itineraryData.interests.join(", ")}</strong> con un presupuesto{" "}
              <strong>{itineraryData.budget.toLowerCase()}</strong>. Incluye visitas a los principales museos de la
              ciudad, con tiempo para disfrutar de la gastronomía local.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-teal-50 rounded-lg p-4">
                <h3 className="font-medium text-teal-900 mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                  Duración
                </h3>
                <p className="text-gray-700">{itineraryData.duration} días completos</p>
              </div>

              <div className="bg-teal-50 rounded-lg p-4">
                <h3 className="font-medium text-teal-900 mb-2 flex items-center">
                  <Euro className="h-5 w-5 mr-2 text-teal-600" />
                  Presupuesto estimado
                </h3>
                <p className="text-gray-700">
                  {calculateTotalCost()} {itineraryData.currency} (solo entradas y comidas)
                </p>
              </div>

              <div className="bg-teal-50 rounded-lg p-4">
                <h3 className="font-medium text-teal-900 mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-teal-600" />
                  Enfoque principal
                </h3>
                <p className="text-gray-700">{itineraryData.interests.join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista por día */}
        <Accordion type="single" collapsible defaultValue="day-1" className="mb-8">
          {itineraryData.days.map((day) => (
            <AccordionItem key={`day-${day.day}`} value={`day-${day.day}`}>
              <AccordionTrigger className="hover:bg-teal-50 px-4 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-teal-100 text-teal-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
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
                      className="relative pl-8 border-l-2 border-teal-200 pb-6 last:border-l-0 last:pb-0"
                    >
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-teal-600"></div>
                      <div className="mb-2 flex items-center">
                        <span className="text-sm text-gray-500 mr-3">{activity.time}</span>
                        <Badge
                          className={`${
                            activity.type === "museo"
                              ? "bg-blue-100 text-blue-800"
                              : activity.type === "comida"
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

                      <Card className="border-teal-100">
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
                              <h3 className="font-bold text-lg text-teal-900 mb-1">{activity.title}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span className="ml-1 text-sm">{activity.rating}</span>
                                </div>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{activity.duration}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{renderPriceRange(activity.priceRange)}</span>
                              </div>
                              <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">{activity.location}</p>
                                    <p className="text-xs text-gray-500">{activity.address}</p>
                                  </div>
                                </div>
                                {activity.price !== null && (
                                  <div className="flex items-center gap-2">
                                    <Euro className="h-4 w-4 text-teal-600" />
                                    <p className="text-sm">
                                      {activity.price === 0
                                        ? "Entrada gratuita"
                                        : `${activity.price} ${itineraryData.currency}`}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {activity.ticketUrl && (
                                <div className="mt-3">
                                  <Button variant="outline" size="sm" className="text-teal-700" asChild>
                                    <Link to={activity.ticketUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                      Comprar entradas
                                    </Link>
                                  </Button>
                                </div>
                              )}
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

        {/* Mapa general */}
        <Card className="border-teal-100 shadow-md mb-8">
          <CardHeader>
            <CardTitle>Mapa del itinerario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Mapa interactivo</p>
                <p className="text-sm">(Integración con Google Maps)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones adicionales */}
        <Card className="border-teal-100 shadow-md mb-8">
          <CardHeader>
            <CardTitle>Recomendaciones adicionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-teal-900">Transporte</h3>
              <p className="text-gray-700">
                Para moverte por París, te recomendamos comprar un pase de transporte público (Paris Visite) que te
                permitirá usar el metro, autobuses y RER. Costo aproximado: 38.35€ para 5 días (zonas 1-3).
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-teal-700" asChild>
                  <Link to="https://www.ratp.fr/en/titres-et-tarifs/paris-visite-travel-pass" target="_blank">
                    <Train className="h-3.5 w-3.5 mr-1.5" />
                    Comprar Paris Visite
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-teal-900">Pases de museos</h3>
              <p className="text-gray-700">
                Considera comprar el Paris Museum Pass, que te dará acceso a más de 50 museos y monumentos, incluyendo
                muchos de los que visitarás en este itinerario. Costo: 85€ para 6 días.
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-teal-700" asChild>
                  <Link to="https://www.parismuseumpass.fr/en" target="_blank">
                    <Info className="h-3.5 w-3.5 mr-1.5" />
                    Paris Museum Pass
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-teal-900">Consejos prácticos</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Muchos museos en París son gratuitos el primer domingo de cada mes.</li>
                <li>
                  La mayoría de los museos están cerrados los lunes o martes, verifica los horarios antes de tu visita.
                </li>
                <li>
                  Reserva tus entradas con anticipación para evitar largas filas, especialmente en temporada alta.
                </li>
                <li>Lleva contigo una botella de agua reutilizable, muchos museos tienen fuentes de agua potable.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Modificar búsqueda
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveItinerary}>
            {isSaved ? "Guardado en mi perfil" : "Guardar en mi perfil"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ItinerarioResultadoPage
