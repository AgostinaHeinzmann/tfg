import { client } from "../axios/axios.config"

export interface Message {
  id: number
  usuario_id: number
  mensaje: string
  fecha_creacion: string
  usuario?: {
    nombre: string
    apellido: string
    imagen_perfil: string
  }
}

export interface SendMessageData {
  usuario_id: number
  mensaje: string
}

// Obtener mensajes del chat de un evento
export const getEventMessages = async (eventId: number) => {
  const response = await client.get(`/event/${eventId}/messages`)
  return response.data
}

// Enviar mensaje al chat de un evento
export const sendEventMessage = async (eventId: number, data: SendMessageData) => {
  const response = await client.post(`/event/${eventId}/messages`, data)
  return response.data
}
