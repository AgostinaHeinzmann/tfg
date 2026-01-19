import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { MapPin, Palette, Utensils, Music, Mountain, Waves, Moon, Clock } from "lucide-react"
import ItinerarioResultadoPage from "./ItinerarioResultadoPage"
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogContent } from "@/components/ui/dialog"
import { searchItineraries, saveItineraryToProfile } from "@/services/itinerarioService"
import { showToast } from "@/lib/toast-utils"
import { auth } from "../../firebase/firebase.config"


const BuscarItinerarioPage: React.FC = () => {
  const [destination, setDestination] = useState("")
  const [duration, setDuration] = useState([5])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const interests = [
    { id: "cultura", name: "Cultura", icon: Palette },
    { id: "gastronomia", name: "Gastronomía", icon: Utensils },
    { id: "musica", name: "Música", icon: Music },
    { id: "aventura", name: "Aventura", icon: Mountain },
    { id: "playa", name: "Playa", icon: Waves },
    { id: "vida-nocturna", name: "Vida nocturna", icon: Moon },
  ]

  const popularItineraries = [
    {
      id: "1",
      destination: "Barcelona, España",
      duration: 5,
      image: "/imagenes/barcelona.webp?height=200&width=300",
      tags: ["Cultura", "Gastronomía", "Playa"],
    },
    {
      id: "2",
      destination: "Tokio, Japón",
      duration: 7,
      image: "/imagenes/tokio.jpg?height=200&width=300",
      tags: ["Cultura", "Gastronomía", "Tecnología"],
    },
    {
      id: "3",
      destination: "Nueva York, EE.UU.",
      duration: 4,
      image: "/imagenes/ny.jpg?height=200&width=300",
      tags: ["Cultura", "Vida nocturna", "Compras"],
    },
  ]

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    )
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
      setSearchResults(response.data || [])

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
                      {result.interests.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-indigo-700 border-indigo-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => {
                          setSelectedItinerary(result)
                          setShowModal(true)
                        }}
                      >
                        Ver itinerario
                      </Button>
                      <Button
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href + "?itinerary=" + result.id)
                        }}
                      >
                        Compartir
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularItineraries.map((itinerary) => (
            <Card key={itinerary.id} className="border-indigo-100 hover:shadow-md transition-shadow">
              <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100">
                <img
                  src={itinerary.image || "/placeholder.svg"}
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
                  {itinerary.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-indigo-700 border-indigo-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => {
                    setSelectedItinerary(itinerary)
                    setShowModal(true)
                  }}
                >
                  Ver itinerario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Modal con el resultado */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl p-0">
          <div className="max-h-[80vh] overflow-y-auto px-4 py-6">
            <ItinerarioResultadoPage
              itinerary={selectedItinerary}
              onClose={handleModifySearch}
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default BuscarItinerarioPage
