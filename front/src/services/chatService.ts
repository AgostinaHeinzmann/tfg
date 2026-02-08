import { client } from "../axios/axios.config"

export interface ChatUser {
  id: number
  nombre: string
  apellido: string
  imagen_perfil: string | null
}

export interface Message {
  id: number
  usuario_id: number
  mensaje: string
  fecha_creacion: string
  usuario: ChatUser
  isHost?: boolean
}

export interface ChatEvent {
  evento_id: number
  nombre_evento: string
  descripcion_evento: string
  fecha_inicio: string
  horario: string
  duracion: number
  cant_participantes: number
  imagen: string | null
  ubicacion?: string
  direccion?: {
    calle: string
    numero: string
    ciudad?: string
    pais?: string
  }
  creador_id: number
}

// Respuesta del backend (con nombres en inglés)
export interface ChatInfoResponse {
  event: ChatEvent
  participants: ChatUser[]
  messages: Message[]
}

// Interfaz normalizada para uso interno
export interface ChatInfo {
  evento: ChatEvent
  participantes: ChatUser[]
  mensajes: Message[]
}

export interface ChatListItem {
  evento_id: number
  nombre_evento: string
  imagen: string | null
  ultimo_mensaje: string | null
  ultimo_mensaje_fecha: string | null
  unread_count: number
  es_creador: boolean
}

export interface SendMessageData {
  mensaje: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

// Obtener lista de chats del usuario con mensajes no leídos
export const getUserChats = async (): Promise<{ chats: ChatListItem[], totalUnread: number }> => {
  const response = await client.get<ApiResponse<{ chats: ChatListItem[], totalUnread: number }>>('/chat')
  return response.data.data
}

// Obtener total de mensajes no leídos
export const getUnreadCount = async (): Promise<number> => {
  const response = await client.get<ApiResponse<{ totalUnread: number }>>('/chat/unread')
  return response.data.data.totalUnread
}

// Obtener mensajes del chat de un evento + info del evento y participantes
export const getChatMessages = async (eventId: number): Promise<ChatInfo> => {
  const response = await client.get<ApiResponse<ChatInfoResponse>>(`/chat/${eventId}/messages`)
  const data = response.data.data
  // Normalizar nombres de propiedades
  return {
    evento: data.event,
    participantes: data.participants || [],
    mensajes: data.messages || []
  }
}

// Enviar mensaje al chat de un evento
export const sendChatMessage = async (eventId: number, data: SendMessageData): Promise<Message> => {
  const response = await client.post<ApiResponse<Message>>(`/chat/${eventId}/message`, data)
  return response.data.data
}

// Marcar chat como leído
export const markChatAsRead = async (eventId: number): Promise<void> => {
  await client.post(`/chat/${eventId}/read`)
}
