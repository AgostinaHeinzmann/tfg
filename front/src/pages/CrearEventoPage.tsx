import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
import { CalendarIcon, ImageIcon, AlertCircle, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Map } from "../components/map"
import { showToast } from "../lib/toast-utils"
import { createEvent, updateEvent, getEventById } from "../services/eventService"
import { getFilters } from "../services/filtrosService"
import { auth } from "../../firebase/firebase.config"
import { loadFromLocalStorage } from "@/lib/utils"

const CrearEventoPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  })
  const [coverImage, setCoverImage] = useState<{
    base64: string | null
    mimeType: string | null
    preview: string | null
  }>({
    base64: null,
    mimeType: null,
    preview: null
  })
  const [loading, setLoading] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(isEditing)
  const [interesesOptions, setInteresesOptions] = useState<Array<{ id: number; tipo: string }>>([]) 

  // Cargar opciones de intereses desde el backend
  useEffect(() => {
    const loadIntereses = async () => {
      try {
        const response: any = await getFilters()
        if (response.success && response.data?.intereses) {
          setInteresesOptions(response.data.intereses)
        }
      } catch (error) {
        console.error("Error loading intereses:", error)
      }
    }
    loadIntereses()
  }, [])

  // Cargar datos del evento si estamos editando
  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return

      setLoadingEvent(true)
      try {
        const response: any = await getEventById(Number(id))
        const event = response.data

        // Verificar que el usuario actual es el propietario
        const userData = loadFromLocalStorage("userData")
        if (event.usuario_id !== userData?.usuario_id) {
          showToast.error("Acceso denegado", "Solo el creador del evento puede editarlo")
          navigate("/eventos")
          return
        }

        // Cargar datos del evento en el formulario
        setForm({
          title: event.nombre_evento || "",
          description: event.descripcion_evento || "",
          category: "", // TODO: cargar categoria si existe
          maxParticipants: event.cant_participantes?.toString() || "10",
          location: event.calle || "",
          coordinates: event.latitud && event.longitud 
            ? [event.latitud, event.longitud] 
            : [41.3851, 2.1734],
          date: event.fecha_inicio ? new Date(event.fecha_inicio) : undefined,
          time: event.horario || "",
          duration: event.duracion?.toString() || "2",
          ageRestriction: !!event.restriccion_edad,
          minAge: event.restriccion_edad?.toString() || "18",
          privateEvent: false,
        })

        // Cargar imagen si existe
        if (event.imagen_base64) {
          setCoverImage({
            base64: event.imagen_base64,
            mimeType: event.imagen_mime_type || "image/jpeg",
            preview: `data:${event.imagen_mime_type || "image/jpeg"};base64,${event.imagen_base64}`
          })
        }
      } catch (error: any) {
        console.error("Error loading event:", error)
        showToast.error("Error", "No se pudo cargar el evento")
        navigate("/eventos")
      } finally {
        setLoadingEvent(false)
      }
    }

    loadEventData()
  }, [id, navigate])

  // Detección de ubicación inicial (solo para crear)
  useEffect(() => {
    if (!isEditing && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({ ...prev, coordinates: [pos.coords.latitude, pos.coords.longitude] }))
        },
        () => { },
        { enableHighAccuracy: true }
      )
    }
  }, [isEditing])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm({ ...form, [name]: e.target.checked })
    } else {
      setForm({ ...form, [name]: value })
      // Geocodificación automática al escribir ubicación
      if (name === "location" && value.length > 5) {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Error", "La imagen no puede superar los 5MB")
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      showToast.error("Error", "Solo se permiten archivos de imagen")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      // Extraer base64 sin el prefijo "data:..."
      const base64 = result.split(",")[1]
      setCoverImage({
        base64,
        mimeType: file.type,
        preview: result
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setCoverImage({
      base64: null,
      mimeType: null,
      preview: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación - más flexible en modo edición
    if (isEditing) {
      // En modo edición, solo validar título (campo mínimo requerido)
      if (!form.title) {
        showToast.error("Error", "El título del evento es obligatorio")
        return
      }
    } else {
      // En modo creación, validar todos los campos obligatorios
      if (!form.title || !form.description || !form.category || !form.maxParticipants || !form.location || !form.date || !form.time || !form.duration) {
        showToast.error("Error", "Completa todos los campos obligatorios")
        return
      }
    }

    const user = auth.currentUser
    if (!user) {
      showToast.warning("Inicia sesión", "Debes iniciar sesión para crear un evento")
      navigate("/login")
      return
    }

    // Obtener usuario_id del localStorage
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
        fecha_inicio: form.date ? form.date.toISOString().split('T')[0] : undefined,
        horario: form.time,
        duracion: form.duration ? parseFloat(form.duration) : undefined,
        cant_participantes: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
        usuario_id: usuarioId,
        calle: form.location || undefined,
        latitud: form.coordinates[0],
        longitud: form.coordinates[1]
      }

      // Agregar intereses/categoría si está seleccionada
      if (form.category) {
        eventData.intereses = [form.category]
      }

      // Agregar restricción de edad si está activada
      if (form.ageRestriction) {
        eventData.restriccion_edad = parseInt(form.minAge)
      } else {
        eventData.restriccion_edad = null
      }

      // Agregar imagen de portada si existe
      if (coverImage.base64) {
        eventData.imagen_base64 = coverImage.base64
        eventData.imagen_mime_type = coverImage.mimeType
      } else {
        eventData.imagen_base64 = null
        eventData.imagen_mime_type = null
      }

      if (isEditing) {
        // Actualizar evento existente
        await updateEvent(Number(id), eventData)
        showToast.success("Evento actualizado", "Los cambios se guardaron correctamente.")
      } else {
        // Crear nuevo evento
        await createEvent(eventData)
        showToast.success("Evento creado", "Tu evento ha sido registrado correctamente.")
      }

      navigate("/eventos")
    } catch (error: any) {
      console.error("Error saving event:", error)
      showToast.error(
        isEditing ? "Error al actualizar evento" : "Error al crear evento",
        error.message || "No se pudo guardar el evento"
      )
    } finally {
      setLoading(false)
    }
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            {isEditing ? "Editar evento" : "Crear un nuevo evento"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Modifica los detalles de tu evento"
              : "Comparte tu experiencia con otros viajeros y crea conexiones inolvidables"}
          </p>
        </div>

        {!isEditing && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Para crear un evento, es necesario tener la identidad verificada. Los eventos con restricción de edad
              requerirán que los participantes verifiquen su identidad.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="border-indigo-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Proporciona los detalles principales de tu evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del evento {!isEditing && '*'}</Label>
                <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Ej. Tour gastronómico por Barcelona" required={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción {!isEditing && '*'}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe tu evento, qué harán los participantes, qué deben llevar, etc."
                  className="min-h-[120px] resize-none"
                  required={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría {!isEditing && '*'}</Label>
                  <Select value={form.category} onValueChange={v => handleSelect("category", v)} required={!isEditing}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {interesesOptions.length > 0 ? (
                        interesesOptions
                          .filter((interes, index, self) => 
                            index === self.findIndex((i) => i.tipo === interes.tipo)
                          )
                          .map((interes) => (
                          <SelectItem key={interes.tipo} value={interes.tipo}>
                            {interes.tipo}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Cultura">Cultura</SelectItem>
                          <SelectItem value="Gastronomía">Gastronomía</SelectItem>
                          <SelectItem value="Aventura">Aventura</SelectItem>
                          <SelectItem value="Fiesta">Fiesta</SelectItem>
                          <SelectItem value="Deporte">Deporte</SelectItem>
                          <SelectItem value="Naturaleza">Naturaleza</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-participants">Número máximo de participantes {!isEditing && '*'}</Label>
                  <Input id="max-participants" name="maxParticipants" type="number" min="1" max="100" value={form.maxParticipants} onChange={handleChange} required={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Imagen de portada</CardTitle>
              <CardDescription>Añade una imagen atractiva para tu evento</CardDescription>
            </CardHeader>
            <CardContent>
              {coverImage.preview ? (
                <div className="relative">
                  <img
                    src={coverImage.preview}
                    alt="Portada del evento"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">Haz clic para seleccionar una imagen</p>
                  <p className="text-xs text-gray-400">PNG, JPG o JPEG (máx. 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
              />
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Ubicación y fecha</CardTitle>
              <CardDescription>¿Dónde y cuándo se realizará tu evento?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación {!isEditing && '*'}</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Dirección completa del evento"
                  value={form.location}
                  onChange={handleChange}
                  required={!isEditing}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Fecha {!isEditing && '*'}</Label>
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
                  <Label htmlFor="time">Hora {!isEditing && '*'}</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    required={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (horas) {!isEditing && '*'}</Label>
                  <Input id="duration" name="duration" type="number" min="0.5" step="0.5" value={form.duration} onChange={handleChange} required={!isEditing} />
                </div>
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Guardando..." : "Creando..."}
                </>
              ) : (
                isEditing ? "Guardar cambios" : "Crear evento"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CrearEventoPage
