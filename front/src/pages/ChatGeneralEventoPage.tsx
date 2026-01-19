import { useState, useEffect } from "react"
import EventoChatPage from "./EventoChatPage"
import { getUserEvents } from "../services/eventService"
import { loadFromLocalStorage } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface EventoChat {
  id: number
  title: string
  image: string
  date: string
  role: string
}

const ChatEventosPage: React.FC = () => {
  const [eventos, setEventos] = useState<EventoChat[]>([])
  const [eventoSeleccionado, setEventoSeleccionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const userData = loadFromLocalStorage("userData")
        const usuarioId = userData?.usuario_id

        if (!usuarioId) {
          navigate("/login")
          return
        }

        const data = await getUserEvents(usuarioId)
        setEventos(data)
        if (data.length > 0) {
          setEventoSeleccionado(String(data[0].id))
        }
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [navigate])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando chats...</div>
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-indigo-100 p-4">
        <h2 className="text-lg font-bold mb-4 text-indigo-900">Tus eventos</h2>
        {eventos.length === 0 ? (
          <p className="text-gray-500 text-sm">No estás suscrito a ningún evento.</p>
        ) : (
          <ul className="space-y-2">
            {eventos.map((evento) => (
              <li key={evento.id}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition ${eventoSeleccionado === String(evento.id)
                      ? "bg-indigo-100 text-indigo-900 font-semibold"
                      : "hover:bg-indigo-50 text-gray-700"
                    }`}
                  onClick={() => setEventoSeleccionado(String(evento.id))}
                >
                  <img
                    src={evento.image.startsWith("http") ? evento.image : `${import.meta.env.VITE_API_URL}${evento.image}`}
                    alt={evento.title}
                    className="h-8 w-8 rounded mr-3 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                  <div className="text-left overflow-hidden">
                    <span className="block truncate">{evento.title}</span>
                    <span className="text-xs text-gray-500">{evento.role}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      {/* Chat */}
      <main className="flex-1">
        {eventoSeleccionado ? (
          <EventoChatPage id={eventoSeleccionado} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Selecciona un evento para ver el chat
          </div>
        )}
      </main>
    </div>
  )
}

export default ChatEventosPage