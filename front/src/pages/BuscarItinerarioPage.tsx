import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, MapPin, Palette, Utensils, Music, Mountain, Waves, Moon, Clock } from "lucide-react"

const BuscarItinerarioPage: React.FC = () => {
  const navigate = useNavigate()
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState<Date>()
  const [duration, setDuration] = useState([5])
  const [budget, setBudget] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

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
      tags: ["Cultura", "Gastronomía"],
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

  const handleGenerateItinerary = () => {
    // Aquí iría la lógica para generar el itinerario
    navigate("/itinerario/resultado")
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
            {/* Destination and Date */}
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

              <div className="space-y-2">
                <Label className="text-base font-medium">Fechas de viaje</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
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
                      className={`h-auto p-4 flex flex-col items-center gap-2 ${
                        isSelected
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
              disabled={!destination || !date || selectedInterests.length === 0}
            >
              Buscar itinerario
            </Button>
          </CardContent>
        </Card>

        {/* Popular Itineraries */}
        <div className="text-center mb-8">
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
                  onClick={() => navigate("/itinerario/resultado")}
                >
                  Ver itinerario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuscarItinerarioPage
