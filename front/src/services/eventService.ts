import { client } from '../axios/axios.config'

export interface EventFilters {
  location?: string
  interests?: string
  ageGroup?: number
  date?: string
  size?: number
  page?: number
}

export interface CreateEventData {
  nombre_evento: string
  descripcion_evento: string
  fecha_inicio: string
  horario: string
  duracion: number
  cant_participantes: number
  restriccion_edad?: number
  direccion_id?: number
  usuario_id: number
  calle?: string
  numero?: string
  imagen_id?: number
}

export interface UpdateEventData extends Partial<CreateEventData> {}

/**
 * Obtener todos los eventos con filtros opcionales
 */
export const getAllEvents = async (filters?: EventFilters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters?.location) params.append('location', filters.location)
    if (filters?.interests) params.append('interests', filters.interests)
    if (filters?.ageGroup !== undefined) params.append('ageGroup', filters.ageGroup.toString())
    if (filters?.date) params.append('date', filters.date)
    if (filters?.size) params.append('size', filters.size.toString())
    if (filters?.page !== undefined) params.append('page', filters.page.toString())

    const response = await client.get(`/event?${params.toString()}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * Obtener un evento por ID
 */
export const getEventById = async (id: number) => {
  try {
    const response = await client.get(`/event/${id}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching event:', error)
    throw error
  }
}

/**
 * Crear un nuevo evento
 */
export const createEvent = async (eventData: CreateEventData) => {
  try {
    const response = await client.post('/event', eventData)
    return response.data
  } catch (error: any) {
    console.error('Error creating event:', error)
    throw error
  }
}

/**
 * Actualizar un evento existente
 */
export const updateEvent = async (id: number, eventData: UpdateEventData) => {
  try {
    const response = await client.put(`/event/${id}`, eventData)
    return response.data
  } catch (error: any) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Eliminar un evento
 */
export const deleteEvent = async (id: number) => {
  try {
    const response = await client.delete(`/event/${id}`)
    return response.data
  } catch (error: any) {
    console.error('Error deleting event:', error)
    throw error
  }
}

/**
 * Obtener mensajes de un evento
 */
export const getEventMessages = async (id: number) => {
  try {
    const response = await client.get(`/event/${id}/messages`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching event messages:', error)
    throw error
  }
}

/**
 * Registrar usuario a un evento
 */
export const registerUserToEvent = async (eventId: number, usuarioId: number) => {
  try {
    const response = await client.post(`/event/${eventId}/register`, { usuario_id: usuarioId })
    return response.data
  } catch (error: any) {
    console.error('Error registering user to event:', error)
    throw error
  }
}

/**
 * Desregistrar usuario de un evento
 */
export const unregisterUserFromEvent = async (eventId: number, usuarioId: number) => {
  try {
    const response = await client.delete(`/event/${eventId}/register/${usuarioId}`)
    return response.data
  } catch (error: any) {
    console.error('Error unregistering user from event:', error)
    throw error
  }
}

