import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { MapPin, Palette, Utensils, Music, Mountain, Waves, Moon, Clock, Loader2 } from "lucide-react"
import ItinerarioResultadoPage from "./ItinerarioResultadoPage"
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogContent } from "@/components/ui/dialog"
import { searchItineraries, saveItineraryToProfile, getPopularItineraries, getItineraryDays } from "@/services/itinerarioService"
import { showToast } from "@/lib/toast-utils"
import { auth } from "../../firebase/firebase.config"


const BuscarItinerarioPage: React.FC = () => {
  const [destination, setDestination] = useState("")
  const [duration, setDuration] = useState([5])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [popularItineraries, setPopularItineraries] = useState<any[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingItinerary, setLoadingItinerary] = useState(false)
  const [isFromPopular, setIsFromPopular] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Mapa de coordenadas de ciudades conocidas
  const cityCoordinates: { [key: string]: [number, number] } = {
    'Buenos Aires': [-34.6037, -58.3816],
    'Córdoba': [-31.4201, -64.1888],
    'Rosario': [-32.9442, -60.6505],
    'Mendoza': [-32.8895, -68.8458],
    'La Plata': [-34.9205, -57.9536],
    'San Miguel de Tucumán': [-26.8303, -65.2037],
    'Mar del Plata': [-38.0023, -57.5575],
    'Salta': [-24.7821, -65.4232],
    'Santa Fe': [-31.6107, -60.6973],
    'Bariloche': [-41.1335, -71.3103],
    'Ushuaia': [-54.8019, -68.3030],
    'Santiago': [-33.4489, -70.6693],
    'Río de Janeiro': [-22.9068, -43.1729],
    'São Paulo': [-23.5505, -46.6333],
    'Montevideo': [-34.9011, -56.1645],
    'Lima': [-12.0464, -77.0428],
    'Bogotá': [4.7110, -74.0721],
    'Madrid': [40.4168, -3.7038],
    'Barcelona': [41.3851, 2.1734],
    'París': [48.8566, 2.3522],
    'Roma': [41.9028, 12.4964],
    'Londres': [51.5074, -0.1278],
    'Nueva York': [40.7128, -74.0060],
  }

  // Función para obtener coordenadas de una ciudad
  const getCityCoordinates = (cityName: string): [number, number] => {
    if (!cityName) return [-34.6037, -58.3816] // Default Buenos Aires
    
    // Buscar coincidencia exacta o parcial
    const normalizedCity = cityName.toLowerCase().trim()
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (city.toLowerCase() === normalizedCity || normalizedCity.includes(city.toLowerCase())) {
        return coords
      }
    }
    return [-34.6037, -58.3816] // Default
  }

  const interests = [
    { id: "cultura", name: "Cultura", icon: Palette },
    { id: "gastronomia", name: "Gastronomía", icon: Utensils },
    { id: "musica", name: "Música", icon: Music },
    { id: "aventura", name: "Aventura", icon: Mountain },
    { id: "playa", name: "Playa", icon: Waves },
    { id: "vida-nocturna", name: "Vida nocturna", icon: Moon },
  ]

  // Cargar itinerarios populares al montar el componente
  useEffect(() => {
    const loadPopularItineraries = async () => {
      try {
        setLoadingPopular(true)
        const response: any = await getPopularItineraries(6)
        
        // Transformar los datos de la API al formato esperado
        // Manejar estructura anidada si existe
        const transformedData = (response.data || []).map((item: any) => {
          const cityName = item.ciudad?.nombre || item.ciudad_nombre || ''
          return {
            id: item.itinerario_id || item.id,
            itinerario_id: item.itinerario_id || item.id,
            // Usar mensaje como título principal del itinerario
            destination: item.mensaje || cityName || item.destination || 'Destino',
            duration: item.duracion ? parseInt(item.duracion) : item.duration || 0,
            description: item.resumen_itinerario || item.description || '',
            interests: item.intereses 
              ? item.intereses.split(',').map((i: string) => i.trim()) 
              : (item.interests || item.tags || []),
            coverImage: item.imagen || item.coverImage || item.image || '/placeholder.svg',
            ciudad_nombre: cityName,
            mensaje: item.mensaje,
            coordinates: getCityCoordinates(cityName),
            ...item
          }
        })
        
        setPopularItineraries(transformedData)
      } catch (error) {
        console.error("Error loading popular itineraries:", error)
        setPopularItineraries([])
      } finally {
        setLoadingPopular(false)
      }
    }

    loadPopularItineraries()
  }, [])

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    )
  }

  // Función para cargar los días del itinerario y abrir el modal
  const handleViewItinerary = async (itinerary: any, fromPopular: boolean = false) => {
    try {
      setLoadingItinerary(true)
      setIsFromPopular(fromPopular)
      const itinerarioId = itinerary.id || itinerary.itinerario_id
      
      // Obtener coordenadas de la ciudad del itinerario
      const cityName = itinerary.ciudad_nombre || itinerary.ciudad?.nombre || itinerary.destination || ''
      const cityCoords = getCityCoordinates(cityName)
      
      // Obtener los días del itinerario desde el backend
      const response: any = await getItineraryDays(itinerarioId)
      
      // Transformar los datos de itinerario_por_dia al formato esperado
      const daysData = response.data || []
      
      // Agrupar actividades por día
      const dayMap = new Map<number, any[]>()
      daysData.forEach((item: any) => {
        // Extraer el número del día del nombre (ej: "Día 1: Centro Histórico" -> 1)
        const dayMatch = item.nombre?.match(/Día\s*(\d+)/i)
        const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1
        
        // Construir la dirección desde el objeto anidado
        const direccionObj = item.direccion
        const addressString = direccionObj && typeof direccionObj === 'object'
          ? `${direccionObj.calle || ''} ${direccionObj.numero || ''}`.trim()
          : (typeof item.direccion === 'string' ? item.direccion : '')
        
        // Usar coordenadas de la ciudad como fallback
        const activityCoords: [number, number] = [
          item.latitud || item.lat || cityCoords[0],
          item.longitud || item.lng || cityCoords[1]
        ]
        
        const activity = {
          id: item.itinerario_por_dia_id?.toString() || item.id?.toString(),
          title: item.nombre?.replace(/Día\s*\d+:\s*/i, '') || item.nombre || 'Actividad',
          description: item.descripcion || '',
          location: item.direccion_nombre || item.nombre?.replace(/Día\s*\d+:\s*/i, '') || '',
          address: item.direccion_completa || addressString || '',
          coordinates: activityCoords,
          time: item.hora || '09:00',
          duration: item.duracion || '2 horas',
          price: item.precio || null,
          ticketUrl: item.enlace_oficial || item.ticketUrl,
          imageUrl: item.imagen || '/placeholder.svg',
          rating: item.rating || 4.5,
          type: (item.tipo || item.interes?.toLowerCase().includes('museo') ? 'museo' : 'atracción') as "museo" | "atracción" | "transporte" | "descanso"
        }
        
        if (!dayMap.has(dayNumber)) {
          dayMap.set(dayNumber, [])
        }
        dayMap.get(dayNumber)!.push(activity)
      })
      
      // Convertir el mapa a array de días
      const days = Array.from(dayMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([dayNumber, activities]) => ({
          day: dayNumber,
          activities
        }))
      
      // Agregar los días al itinerario seleccionado
      const itineraryWithDays = {
        ...itinerary,
        days,
        coordinates: itinerary.coordinates || cityCoords
      }
      
      setSelectedItinerary(itineraryWithDays)
      setShowModal(true)
    } catch (error) {
      console.error('Error loading itinerary days:', error)
      // Si falla, mostrar el itinerario sin días
      setSelectedItinerary(itinerary)
      setShowModal(true)
    } finally {
      setLoadingItinerary(false)
    }
  }

  const handleGenerateItinerary = async () => {
    if (!destination) {
      showToast.warning("Destino requerido", "Por favor ingresa un destino para buscar itinerarios")
      return
    }

    if (selectedInterests.length === 0) {
      showToast.warning("Intereses requeridos", "Por favor selecciona al menos un interés")
      return
    }

    try {
      const filters = {
        destination,
        duration: `${duration[0]} ${duration[0] === 1 ? 'día' : 'días'}`,
        interests: selectedInterests.join(',')
      }

      const response: any = await searchItineraries(filters)
      
      // Transformar los datos de la API al formato esperado por el componente
      const transformedResults = (response.data || []).map((item: any) => {
        const cityName = item.ciudad?.nombre || item.ciudad_nombre || ''
        return {
          id: item.itinerario_id,
          itinerario_id: item.itinerario_id,
          // Usar mensaje como título principal del itinerario
          destination: item.mensaje || cityName || 'Destino',
          duration: item.duracion ? parseInt(item.duracion) : duration[0],
          description: item.resumen_itinerario || item.description || '',
          interests: item.intereses ? item.intereses.split(',').map((i: string) => i.trim()) : [],
          coverImage: item.imagen || item.coverImage || '/placeholder.svg',
          ciudad_nombre: cityName,
          mensaje: item.mensaje,
          coordinates: getCityCoordinates(cityName),
          // Mantener los datos originales por si se necesitan
          ...item
        }
      })
      
      setSearchResults(transformedResults)

      if (!response.data || response.data.length === 0) {
        showToast.info("Sin resultados", "No se encontraron itinerarios para los criterios seleccionados")
      }

      // Guardar en localStorage
      localStorage.setItem("lastItinerarySearch", JSON.stringify({ destination, duration, selectedInterests }))

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error: any) {
      console.error("Error searching itineraries:", error)
      showToast.error("Error al buscar", error.message || "No se pudieron cargar los itinerarios")
      setSearchResults([])
    }
  }

  const handleModifySearch = () => {
    setShowModal(false)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Buscá tu itinerario perfecto</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Personaliza tu experiencia de viaje según tus intereses y tiempo disponible
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-indigo-100 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-900">Filtros de búsqueda</CardTitle>
            <p className="text-gray-600">Configura los detalles de tu viaje para generar un itinerario personalizado</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-base font-medium">
                  Destino
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="destination"
                    placeholder="Ciudad, país o región"
                    className="pl-10"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Duración del viaje (días)</Label>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {duration[0]} días
                </div>
              </div>
              <Slider value={duration} onValueChange={setDuration} max={30} min={1} step={1} className="w-full" />
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Intereses</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map((interest) => {
                  const Icon = interest.icon
                  const isSelected = selectedInterests.includes(interest.id)

                  return (
                    <Button
                      key={interest.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto p-4 flex flex-col items-center gap-2 ${isSelected
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        }`}
                      onClick={() => toggleInterest(interest.id)}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{interest.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
              onClick={handleGenerateItinerary}
              disabled={!destination || selectedInterests.length === 0}
            >
              Buscar itinerario
            </Button>
          </CardContent>
        </Card>

        {/* Search Results - Debajo del botón */}
        {searchResults.length > 0 && (
          <div ref={resultsRef} className="mt-10">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">Resultados encontrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((result) => (
                <Card key={result.id} className="border-indigo-100 hover:shadow-md transition-shadow">
                  <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100">
                    <img
                      src={result.coverImage || "/placeholder.svg"}
                      alt={result.destination}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-indigo-900 mb-2">{result.destination}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="h-4 w-4" />
                      <span>{result.duration} días</span>
                    </div>
                    <p className="text-gray-700 mb-2">{result.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(result.interests || []).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-indigo-700 border-indigo-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => handleViewItinerary(result)}
                        disabled={loadingItinerary}
                      >
                        {loadingItinerary ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cargando...</>
                        ) : (
                          'Ver itinerario'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Popular Itineraries - Al final */}
        <div className="text-center mb-8 mt-16">
          <h2 className="text-3xl font-bold text-indigo-900 mb-4">Itinerarios recomendados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora itinerarios para inspirarte
          </p>
        </div>

        {loadingPopular ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : popularItineraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularItineraries.map((itinerary) => (
              <Card key={itinerary.id} className="border-indigo-100 hover:shadow-md transition-shadow">
                <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100">
                  <img
                    src={itinerary.coverImage}
                    alt={itinerary.destination}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">{itinerary.destination}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{itinerary.duration} días</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(itinerary.interests || []).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-indigo-700 border-indigo-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => handleViewItinerary(itinerary, true)}
                    disabled={loadingItinerary}
                  >
                    {loadingItinerary ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cargando...</>
                    ) : (
                      'Ver itinerario'
                    )}
                  </Button>
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
              <h3 className="text-xl font-medium text-indigo-900 mb-2">No hay itinerarios recomendados</h3>
              <p className="text-gray-600 text-center max-w-md">
                Usa el buscador de arriba para encontrar itinerarios según tus intereses
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Modal con el resultado */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl p-0">
          <div className="max-h-[80vh] overflow-y-auto px-4 py-6">
            <ItinerarioResultadoPage
              itinerary={selectedItinerary}
              onClose={handleModifySearch}
              isFromPopular={isFromPopular}
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default BuscarItinerarioPage
