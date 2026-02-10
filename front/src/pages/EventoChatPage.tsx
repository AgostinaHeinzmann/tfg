"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
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
  Loader2,
} from "lucide-react"
import { getChatMessages, sendChatMessage, markChatAsRead, type ChatInfo, type Message as ChatMessage } from "../services/chatService"
import { loadFromLocalStorage } from "@/lib/utils"

type Message = {
  id: number
  sender: {
    id: number
    name: string
    avatar?: string
    isHost?: boolean
  }
  text: string
  timestamp: Date
  isCurrentUser: boolean
}

type EventoChatPageProps = { 
  id?: string
  onMessagesRead?: () => void
}

const POLLING_INTERVAL = 5000 // 5 segundos

const EventoChatPage: React.FC<EventoChatPageProps> = (props) => {
  const params = useParams<{ id: string }>()
  const id = props.id || params.id
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const lastMessageIdRef = useRef<number | null>(null)

  // Obtener usuario actual desde localStorage
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  
  useEffect(() => {
    const userData = loadFromLocalStorage("userData")
    if (userData?.usuario_id) {
      setCurrentUserId(userData.usuario_id)
    }
  }, [])

  // Transformar mensajes del backend al formato del componente
  const transformMessages = useCallback((chatData: ChatInfo | null, userId: number | null): Message[] => {
    if (!chatData || !chatData.mensajes) return []
    
    // Obtener el ID del creador del evento
    const creadorId = chatData.evento?.creador_id
    
    return chatData.mensajes
      // Filtrar mensajes del sistema (sin usuario)
      .filter((msg: ChatMessage) => msg.usuario_id && msg.usuario)
      .map((msg: ChatMessage) => ({
        id: msg.id,
        sender: {
          id: msg.usuario_id,
          name: msg.usuario ? `${msg.usuario.nombre} ${msg.usuario.apellido}` : "Usuario",
          avatar: msg.usuario?.imagen_perfil || undefined,
          // Solo mostrar badge de anfitrión si el usuario del mensaje es el creador
          isHost: creadorId !== undefined && msg.usuario_id === creadorId,
        },
        text: msg.mensaje,
        timestamp: new Date(msg.fecha_creacion),
        isCurrentUser: msg.usuario_id === userId,
      }))
  }, [])

  // Cargar mensajes del chat
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!id) return

    try {
      const data = await getChatMessages(Number(id))
      setChatInfo(data)
      
      const transformedMessages = transformMessages(data, currentUserId)
      setMessages(transformedMessages)
      
      // Actualizar último mensaje ID para detectar nuevos mensajes
      if (transformedMessages.length > 0) {
        const lastMsgId = transformedMessages[transformedMessages.length - 1].id
        if (lastMessageIdRef.current !== lastMsgId) {
          lastMessageIdRef.current = lastMsgId
          // Si hay mensajes nuevos y no es la carga inicial, hacer scroll
          if (!isInitial) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        }
      }

      if (isInitial) {
        setLoading(false)
        // Marcar como leído al abrir el chat
        await markChatAsRead(Number(id))
        props.onMessagesRead?.()
      }
      
      setError(null)
    } catch (err) {
      console.error("Error fetching messages:", err)
      if (isInitial) {
        setError("Error al cargar el chat")
        setLoading(false)
      }
    }
  }, [id, currentUserId, transformMessages, props])

  // Carga inicial de mensajes
  useEffect(() => {
    if (currentUserId !== null) {
      fetchMessages(true)
    }
  }, [id, currentUserId])

  // Polling para nuevos mensajes
  useEffect(() => {
    if (!id || loading || currentUserId === null) return

    const interval = setInterval(() => {
      fetchMessages(false)
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [id, loading, currentUserId, fetchMessages])

  // Auto-scroll al último mensaje en carga inicial
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [loading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || !id || sending) return

    setSending(true)
    try {
      await sendChatMessage(Number(id), { mensaje: newMessage.trim() })
      setNewMessage("")
      // Recargar mensajes para obtener el nuevo mensaje con toda la info
      await fetchMessages(false)
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Error al enviar el mensaje")
    } finally {
      setSending(false)
    }
  }

  // Formatear dirección del evento
  const formatLocation = (chatInfo: ChatInfo | null): string => {
    if (!chatInfo?.evento) return "Ubicación no especificada"
    
    // Usar ubicacion o ciudad del backend
    if (chatInfo.evento.ubicacion) {
      return chatInfo.evento.ubicacion
    }
    
    if (chatInfo.evento.ciudad) {
      return chatInfo.evento.ciudad
    }
    
    return "Ubicación no especificada"
  }

  // Formatear fecha del evento
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Fecha no especificada"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Formatear horario del evento
  const formatTime = (horario: string | undefined, duracion: string | number | null | undefined): string => {
    if (!horario) return "Horario no especificado"
    
    // Formatear hora (quitar segundos si vienen en formato HH:MM:SS)
    let formattedTime = horario
    if (horario.match(/^\d{2}:\d{2}:\d{2}$/)) {
      formattedTime = horario.substring(0, 5) // Tomar solo HH:MM
    }
    
    // Si la duración ya es un string formateado (como "2 horas", "1h 30min"), mostrarlo
    if (duracion && typeof duracion === 'string' && isNaN(Number(duracion))) {
      return `${formattedTime} - ${duracion}`
    }
    
    // Si es un número, solo mostrar si es mayor a 10 minutos (para evitar valores sin sentido)
    const duracionNum = duracion ? (typeof duracion === 'string' ? parseInt(duracion, 10) : duracion) : null
    
    if (duracionNum && !isNaN(duracionNum) && duracionNum > 10) {
      if (duracionNum >= 60) {
        const hours = Math.floor(duracionNum / 60)
        const mins = duracionNum % 60
        const durationStr = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
        return `${formattedTime} - ${durationStr}`
      }
      return `${formattedTime} - ${duracionNum} min`
    }
    
    return formattedTime
  }

  // Obtener URL de imagen
  const getImageUrl = (imagen: string | null | undefined): string => {
    if (!imagen) return "/placeholder.svg"
    // Manejar data URIs (base64)
    if (imagen.startsWith("data:")) return imagen
    // URLs absolutas
    if (imagen.startsWith("http")) return imagen
    // Rutas relativas
    return `${import.meta.env.VITE_API_URL}${imagen}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    )
  }

  if (error && !chatInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>
    )
  }

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
                <h1 className="font-bold text-lg text-indigo-900">{chatInfo?.evento?.nombre_evento || "Chat del evento"}</h1>
                <p className="text-sm text-gray-600">Chat del evento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Chat messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-lg border border-indigo-100 shadow-md flex flex-col">
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No hay mensajes aún. ¡Sé el primero en escribir!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.isCurrentUser ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={getImageUrl(message.sender.avatar)} alt={message.sender.name} />
                          <AvatarFallback className="bg-indigo-200 text-indigo-800 text-xs">
                            {message.sender.name
                              ? message.sender.name.split(" ").map((n) => n[0]).join("")
                              : "US"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={`flex items-center gap-2 mb-1 ${message.isCurrentUser ? "flex-row-reverse" : ""}`}>
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
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */}
            <div className="border-t border-gray-100 p-3">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={sending}
                />
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700" 
                  disabled={newMessage.trim() === "" || sending}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
                <img 
                  src={getImageUrl(chatInfo?.evento?.imagen)} 
                  alt={chatInfo?.evento?.nombre_evento || "Evento"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </div>

              <h3 className="font-medium text-indigo-900">{chatInfo?.evento?.nombre_evento}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>{formatLocation(chatInfo)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>{formatDate(chatInfo?.evento?.fecha_inicio)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>{formatTime(chatInfo?.evento?.horario, chatInfo?.evento?.duracion)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>
                    {chatInfo?.participantes?.length || 0}/{chatInfo?.evento?.cant_participantes || "∞"} participantes
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
