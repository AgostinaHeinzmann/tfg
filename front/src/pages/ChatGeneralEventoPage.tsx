import { useState } from "react"
import EventoChatPage from "./EventoChatPage"

const eventosSuscritos = [
  { id: "1", title: "Tour gastronómico por Barcelona", image: "/imagenes/barcelonarestos.jpg" },
  { id: "2", title: "Senderismo en Montserrat", image: "/imagenes/senderismo.jpg" },
  // ...otros eventos
]

const ChatEventosPage: React.FC = () => {
  const [eventoSeleccionado, setEventoSeleccionado] = useState(eventosSuscritos[0].id)

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-indigo-100 p-4">
        <h2 className="text-lg font-bold mb-4 text-indigo-900">Tus eventos</h2>
        <ul className="space-y-2">
          {eventosSuscritos.map((evento) => (
            <li key={evento.id}>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg transition ${
                  eventoSeleccionado === evento.id
                    ? "bg-indigo-100 text-indigo-900 font-semibold"
                    : "hover:bg-indigo-50 text-gray-700"
                }`}
                onClick={() => setEventoSeleccionado(evento.id)}
              >
                <img src={evento.image} alt={evento.title} className="h-8 w-8 rounded mr-3 object-cover" />
                <span>{evento.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Chat */}
      <main className="flex-1">
        <EventoChatPage id={eventoSeleccionado} />
      </main>
    </div>
  )
}

export default ChatEventosPage