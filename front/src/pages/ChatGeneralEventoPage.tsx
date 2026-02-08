import { useState, useEffect, useCallback } from "react"
import EventoChatPage from "./EventoChatPage"
import { getUserChats, type ChatListItem } from "../services/chatService"
import { loadFromLocalStorage } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Badge } from "../components/ui/badge"
import { Loader2, MessageCircle } from "lucide-react"

const POLLING_INTERVAL = 5000 // 5 segundos

const ChatEventosPage: React.FC = () => {
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [eventoSeleccionado, setEventoSeleccionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalUnread, setTotalUnread] = useState(0)
  const navigate = useNavigate()

  // Cargar lista de chats
  const fetchChats = useCallback(async (isInitial = false) => {
    try {
      const userData = loadFromLocalStorage("userData")
      const usuarioId = userData?.usuario_id

      if (!usuarioId) {
        navigate("/login")
        return
      }

      const data = await getUserChats()
      setChats(data.chats)
      setTotalUnread(data.totalUnread)
      
      if (isInitial && data.chats.length > 0) {
        setEventoSeleccionado(String(data.chats[0].evento_id))
      }
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }, [navigate])

  // Carga inicial
  useEffect(() => {
    fetchChats(true)
  }, [fetchChats])

  // Polling para actualizar lista de chats y contadores de no leídos
  useEffect(() => {
    if (loading) return

    const interval = setInterval(() => {
      fetchChats(false)
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [loading, fetchChats])

  // Callback cuando se leen los mensajes de un chat
  const handleMessagesRead = useCallback(() => {
    // Actualizar la lista de chats para reflejar que este chat fue leído
    fetchChats(false)
  }, [fetchChats])

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

  // Formatear fecha del último mensaje
  const formatLastMessageDate = (dateString: string | null): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Ayer"
    } else if (diffDays < 7) {
      return date.toLocaleDateString("es-ES", { weekday: "short" })
    } else {
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Cargando chats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-indigo-100 flex flex-col">
        <div className="p-4 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-indigo-900">Tus chats</h2>
            {totalUnread > 0 && (
              <Badge className="bg-indigo-600 text-white">
                {totalUnread} nuevo{totalUnread > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <MessageCircle className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-sm text-center">No tienes chats activos.</p>
              <p className="text-xs text-center mt-1">Únete o crea un evento para comenzar a chatear.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat) => (
                <li key={chat.evento_id}>
                  <button
                    className={`flex items-center w-full px-3 py-3 rounded-lg transition ${
                      eventoSeleccionado === String(chat.evento_id)
                        ? "bg-indigo-100 text-indigo-900"
                        : "hover:bg-indigo-50 text-gray-700"
                    }`}
                    onClick={() => setEventoSeleccionado(String(chat.evento_id))}
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(chat.imagen)}
                        alt={chat.nombre_evento}
                        className="h-12 w-12 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                      {chat.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2">
                          {chat.unread_count > 9 ? "9+" : chat.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className={`block truncate ${chat.unread_count > 0 ? "font-semibold" : ""}`}>
                          {chat.nombre_evento}
                        </span>
                        {chat.ultimo_mensaje_fecha && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatLastMessageDate(chat.ultimo_mensaje_fecha)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {chat.es_creador && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            Anfitrión
                          </Badge>
                        )}
                        {chat.ultimo_mensaje && (
                          <span className={`text-xs truncate ${chat.unread_count > 0 ? "text-gray-700" : "text-gray-500"}`}>
                            {chat.ultimo_mensaje}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
      
      {/* Chat */}
      <main className="flex-1">
        {eventoSeleccionado ? (
          <EventoChatPage 
            id={eventoSeleccionado} 
            onMessagesRead={handleMessagesRead}
          />
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
            <p>Selecciona un chat para ver los mensajes</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default ChatEventosPage