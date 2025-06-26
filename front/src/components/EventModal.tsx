"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { MapPin, Calendar, Clock, Users, CheckCircle, AlertCircle, Eye } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

type EventModalProps = {
  event: {
    id: string
    title: string
    description: string
    location: string
    date: string
    time: string
    participants: number
    maxParticipants: number
    image: string
    isOfficial: boolean
    category: string
    ageRestriction?: boolean
    minAge?: number
  }
  children: React.ReactNode
}

const EventModal: React.FC<EventModalProps> = ({ event, children }) => {
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)

  const handleJoinEvent = () => {
    if (event.ageRestriction && !isVerified) {
      setShowVerificationAlert(true)
    } else {
      navigate(`/eventos/${event.id}`)
    }
  }

  const handleVerifyIdentity = () => {
    navigate("/verificar-identidad")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            <div className="flex gap-2 mt-2">
              <Badge className={`${event.isOfficial ? "bg-indigo-600" : "bg-orange-500"}`}>
                {event.isOfficial ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Oficial
                  </span>
                ) : (
                  "Usuario"
                )}
              </Badge>
              <Badge className="bg-gray-100 text-gray-800">{event.category}</Badge>
              {event.ageRestriction && <Badge className="bg-amber-500">+{event.minAge}</Badge>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-md overflow-hidden">
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
          </div>

          {showVerificationAlert && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verificación requerida</AlertTitle>
              <AlertDescription>
                Este evento tiene restricción de edad (+{event.minAge}). Debes verificar tu identidad para poder unirte.
                <Button
                  variant="outline"
                  className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={handleVerifyIdentity}
                >
                  Verificar ahora
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <p className="text-gray-700">{event.description}</p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>
                {event.participants}/{event.maxParticipants} participantes
              </span>
            </div>
          </div>

          <div className="h-[150px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Mapa interactivo</p>
              <p className="text-sm">(Integración con Google Maps)</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/eventos/${event.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleJoinEvent}>
              Unirse al evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventModal
