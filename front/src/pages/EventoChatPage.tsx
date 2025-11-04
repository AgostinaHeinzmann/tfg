"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  ChevronLeft,
  Send,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react"

type Message = {
  id: string
  sender: {
    id: string
    name: string
    avatar?: string
    isHost?: boolean
  }
  text: string
  timestamp: Date
  isCurrentUser: boolean
}

type EventoChatPageProps = { id?: string }

const EventoChatPage: React.FC<EventoChatPageProps> = (props) => {
  const params = useParams<{ id: string }>()
  const id = props.id || params.id
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState("")

  // Datos de ejemplo del evento
  const event = {
    id: id,
    title: "Tour gastronómico por Barcelona",
    location: "Plaza Catalunya, Barcelona, España",
    date: "15 de mayo, 2023",
    time: "18:00 - 21:00",
    participants: 12,
    maxParticipants: 15,
    image: "/imagenes/barcelonarestos.jpg?height=200&width=300",
    isOfficial: true,
    category: "Gastronomía",
    host: {
      id: "host1",
      name: "Carlos Rodríguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  }

  // Detectar usuario actual desde localStorage (como en ExperienciasPage)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar?: string; photoURL?: string } | null>(null)
  useEffect(() => {
    // Simulación: buscar datos de usuario en localStorage
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setCurrentUser(parsed)
      } catch {
        setCurrentUser({ id: "user1", name: "María García", avatar: "/placeholder.svg?height=40&width=40" })
      }
    } else {
      setCurrentUser({ id: "user1", name: "María García", avatar: "/placeholder.svg?height=40&width=40" })
    }
  }, [])

  // Mensajes de ejemplo
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: {
        id: "host1",
        name: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        isHost: true,
      },
      text: "¡Hola a todos! Bienvenidos al chat del tour gastronómico. Aquí podemos coordinar detalles antes del evento. ¿Alguien tiene alguna pregunta?",
      timestamp: new Date(2023, 4, 10, 14, 30),
      isCurrentUser: false,
    },
    {
      id: "2",
      sender: {
        id: "user2",
        name: "Juan Pérez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      text: "Hola Carlos, ¿hay algún requisito especial para el tour? ¿Debemos llevar algo?",
      timestamp: new Date(2023, 4, 10, 14, 35),
      isCurrentUser: false,
    },
    {
      id: "3",
      sender: {
        id: "host1",
        name: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        isHost: true,
      },
      text: "¡Buena pregunta Juan! Solo necesitan traer apetito y quizás una botella de agua. Todo lo demás está incluido en el tour.",
      timestamp: new Date(2023, 4, 10, 14, 38),
      isCurrentUser: false,
    },
    {
      id: "4",
      sender: {
        id: "user3",
        name: "Ana Sánchez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      text: "¿El tour es apto para vegetarianos?",
      timestamp: new Date(2023, 4, 10, 15, 5),
      isCurrentUser: false,
    },
    {
      id: "5",
      sender: {
        id: "host1",
        name: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        isHost: true,
      },
      text: "¡Sí, Ana! Tenemos opciones vegetarianas en cada parada. Por favor, avísame si tienes alguna otra restricción alimentaria.",
      timestamp: new Date(2023, 4, 10, 15, 8),
      isCurrentUser: false,
    },
    {
      id: "6",
      sender: {
        id: "user1",
        name: "María García",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      text: "¡Genial! Estoy emocionada por el tour. ¿Nos encontramos directamente en Plaza Catalunya?",
      timestamp: new Date(2023, 4, 10, 16, 20),
      isCurrentUser: true,
    },
    {
      id: "7",
      sender: {
        id: "host1",
        name: "Carlos Rodríguez",
        avatar: "/placeholder.svg?height=40&width=40",
        isHost: true,
      },
      text: "¡Exacto María! Nos encontraremos en la fuente central de Plaza Catalunya a las 18:00. Llevaré un paraguas azul para que puedan identificarme fácilmente.",
      timestamp: new Date(2023, 4, 10, 16, 25),
      isCurrentUser: false,
    },
  ])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || !currentUser) return

    const message: Message = {
      id: Date.now().toString(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.photoURL || currentUser.avatar || "/placeholder.svg?height=40&width=40",
      },
      text: newMessage,
      timestamp: new Date(),
      isCurrentUser: true,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-indigo-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-indigo-700" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg text-indigo-900">{event.title}</h1>
                <p className="text-sm text-gray-600">Chat del evento</p>
              </div>
            </div>
              {/* Removed top 'Detalles' button */}
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Chat messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-lg border border-indigo-100 shadow-md flex flex-col">
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.isCurrentUser ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                        <AvatarFallback className="bg-indigo-200 text-indigo-800 text-xs">
                          {message.sender.name
                            ? message.sender.name.split(" ").map((n) => n[0]).join("")
                            : "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${message.isCurrentUser ? "text-right" : ""}`}>
                            {message.sender.name}
                          </span>
                          {message.sender.isHost && (
                            <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                              <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                              Anfitrión
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.isCurrentUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */}
            <div className="border-t border-gray-100 p-3">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                  {/* Removed Paperclip and ImageIcon buttons for text-only chat */}
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={newMessage.trim() === ""}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Event info sidebar - only visible on desktop */}
        <div className="hidden md:block w-80">
          <Card className="border-indigo-100 shadow-md sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Información del evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-md overflow-hidden">
                <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
              </div>

              <h3 className="font-medium text-indigo-900">{event.title}</h3>

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

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EventoChatPage
