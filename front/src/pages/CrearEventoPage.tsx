import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { Calendar } from "../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Map } from "../components/map"
import { showToast } from "../lib/toast-utils"
import { createEvent } from "../services/eventService"
import { auth } from "../../firebase/firebase.config"
import { loadFromLocalStorage } from "@/lib/utils"

const CrearEventoPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    maxParticipants: "10",
    location: "",
    coordinates: [41.3851, 2.1734] as [number, number],
    date: undefined as Date | undefined,
    time: "",
    duration: "2",
    ageRestriction: false,
    minAge: "18",
    privateEvent: false,
    coverImage: null as File | null,
  })
  const [loading, setLoading] = useState(false)

  // Detección de ubicación inicial
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({ ...prev, coordinates: [pos.coords.latitude, pos.coords.longitude] }))
        },
        () => { },
        { enableHighAccuracy: true }
      )
    }
  }, [])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "file" && e.target instanceof HTMLInputElement) {
      setForm({ ...form, coverImage: e.target.files ? e.target.files[0] : null })
    } else if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm({ ...form, [name]: e.target.checked })
    } else {
      setForm({ ...form, [name]: value })
      // Geocodificación automática al escribir ubicación
      if (name === "location" && value.length > 5) {
        // Ejemplo con Nominatim (OpenStreetMap)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`)
          const data = await res.json()
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            setForm((prev) => ({ ...prev, coordinates: [lat, lon] }))
          }
        } catch (err) {
          // Si falla, no actualiza coordenadas
        }
      }
    }
  }

  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
  }

  const handleDateChange = (date: Date | undefined) => {
    setForm({ ...form, date })
  }

  const handleMapClick = (coords: [number, number], address: string) => {
    setForm({ ...form, coordinates: coords, location: address })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación
    if (!form.title || !form.description || !form.category || !form.maxParticipants || !form.location || !form.date || !form.time || !form.duration) {
      showToast.error("Error", "Completa todos los campos obligatorios")
      return
    }

    const user = auth.currentUser
    if (!user) {
      showToast.warning("Inicia sesión", "Debes iniciar sesión para crear un evento")
      navigate("/login")
      return
    }

    // Obtener usuario_id del localStorage (sincronizado con backend)
    const userData = loadFromLocalStorage("userData")
    const usuarioId = userData?.usuario_id

    if (!usuarioId) {
      showToast.error("Error de sesión", "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
      return
    }

    setLoading(true)

    try {
      // Preparar datos para el backend
      const eventData: any = {
        nombre_evento: form.title,
        descripcion_evento: form.description,
        fecha_inicio: form.date.toISOString().split('T')[0], // formato YYYY-MM-DD
        horario: form.time,
        duracion: parseFloat(form.duration),
        cant_participantes: parseInt(form.maxParticipants),
        usuario_id: usuarioId,
        calle: form.location // Usar location como dirección completa por ahora
      }

      // Agregar restricción de edad si está activada
      if (form.ageRestriction) {
        eventData.restriccion_edad = parseInt(form.minAge)
      }

      // Crear el evento
      await createEvent(eventData)

      showToast.success("Evento creado", "Tu evento ha sido registrado correctamente.")
      navigate("/eventos")
    } catch (error: any) {
      console.error("Error creating event:", error)
      showToast.error("Error al crear evento", error.message || "No se pudo crear el evento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Crear un nuevo evento</h1>
          <p className="text-gray-600">Comparte tu experiencia con otros viajeros y crea conexiones inolvidables</p>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Para crear un evento, es necesario tener la identidad verificada. Los eventos con restricción de edad
            requerirán que los participantes verifiquen su identidad.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card className="border-indigo-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Proporciona los detalles principales de tu evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del evento *</Label>
                <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Ej. Tour gastronómico por Barcelona" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe tu evento, qué harán los participantes, qué deben llevar, etc."
                  className="min-h-[120px] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={form.category} onValueChange={v => handleSelect("category", v)} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cultura">Cultura</SelectItem>
                      <SelectItem value="gastronomia">Gastronomía</SelectItem>
                      <SelectItem value="aventura">Aventura</SelectItem>
                      <SelectItem value="fiesta">Fiesta</SelectItem>
                      <SelectItem value="deporte">Deporte</SelectItem>
                      <SelectItem value="naturaleza">Naturaleza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-participants">Número máximo de participantes *</Label>
                  <Input id="max-participants" name="maxParticipants" type="number" min="1" max="100" value={form.maxParticipants} onChange={handleChange} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Ubicación y fecha</CardTitle>
              <CardDescription>¿Dónde y cuándo se realizará tu evento?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Dirección completa del evento"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
                <div className="mt-3">
                  <Map
                    center={form.coordinates}
                    zoom={16}
                    height="200px"
                    address={form.location}
                    title="Ubicación del evento"
                    showGoogleMapsButton={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.date ? format(form.date, "PPP", { locale: es }) : "Selecciona una fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.date}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input id="time" name="time" type="time" className="pl-10" value={form.time} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (horas) *</Label>
                <Input id="duration" name="duration" type="number" min="0.5" step="0.5" value={form.duration} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Configuración adicional</CardTitle>
              <CardDescription>Personaliza las opciones de tu evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="age-restriction" className="text-base">
                    Restricción de edad
                  </Label>
                  <p className="text-sm text-gray-500">Los participantes deberán verificar su edad para unirse</p>
                </div>
                <Switch id="age-restriction" checked={form.ageRestriction} onCheckedChange={v => setForm({ ...form, ageRestriction: v })} />
              </div>

              {form.ageRestriction && (
                <div className="space-y-2 pl-6 border-l-2 border-indigo-100">
                  <Label htmlFor="min-age">Edad mínima requerida</Label>
                  <Select value={form.minAge} onValueChange={v => handleSelect("minAge", v)}>
                    <SelectTrigger id="min-age">
                      <SelectValue placeholder="Selecciona la edad mínima" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18">18 años</SelectItem>
                      <SelectItem value="21">21 años</SelectItem>
                      <SelectItem value="25">25 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="cover-image">Imagen de portada</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-1">Arrastra una imagen o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-400">PNG, JPG o JPEG (máx. 5MB)</p>
                  <Input id="cover-image" name="coverImage" type="file" className="hidden" accept="image/*" onChange={handleChange} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="private-event" className="text-base">
                    Evento privado
                  </Label>
                  <p className="text-sm text-gray-500">Solo visible para personas con el enlace</p>
                </div>
                <Switch id="private-event" checked={form.privateEvent} onCheckedChange={v => setForm({ ...form, privateEvent: v })} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Creando..." : "Crear evento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CrearEventoPage
