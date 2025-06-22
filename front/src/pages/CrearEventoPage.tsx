"use client"

import type React from "react"
import { useState } from "react"
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
import { CalendarIcon, MapPin, Clock, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

const CrearEventoPage: React.FC = () => {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date>()
  const [ageRestriction, setAgeRestriction] = useState(false)
  const [minAge, setMinAge] = useState("18")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para crear el evento
    navigate("/eventos")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-900 mb-2">Crear un nuevo evento</h1>
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
          <Card className="border-teal-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Proporciona los detalles principales de tu evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del evento *</Label>
                <Input id="title" placeholder="Ej. Tour gastronómico por Barcelona" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu evento, qué harán los participantes, qué deben llevar, etc."
                  className="min-h-[120px] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select required>
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
                  <Input id="max-participants" type="number" min="1" max="100" defaultValue="10" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 shadow-md mb-6">
            <CardHeader>
              <CardTitle>Ubicación y fecha</CardTitle>
              <CardDescription>¿Dónde y cuándo se realizará tu evento?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input id="location" placeholder="Dirección completa del evento" className="pl-10" required />
                </div>
                <div className="h-[200px] mt-3 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Mapa interactivo</p>
                    <p className="text-sm">(Integración con Google Maps)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fecha *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input id="time" type="time" className="pl-10" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (horas) *</Label>
                <Input id="duration" type="number" min="0.5" step="0.5" defaultValue="2" required />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 shadow-md mb-6">
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
                <Switch id="age-restriction" checked={ageRestriction} onCheckedChange={setAgeRestriction} />
              </div>

              {ageRestriction && (
                <div className="space-y-2 pl-6 border-l-2 border-teal-100">
                  <Label htmlFor="min-age">Edad mínima requerida</Label>
                  <Select value={minAge} onValueChange={setMinAge}>
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
                  <Input id="cover-image" type="file" className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="private-event" className="text-base">
                    Evento privado
                  </Label>
                  <p className="text-sm text-gray-500">Solo visible para personas con el enlace</p>
                </div>
                <Switch id="private-event" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              Crear evento
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CrearEventoPage
