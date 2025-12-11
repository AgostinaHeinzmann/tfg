import { client } from '../axios/axios.config'

export interface ItineraryFilters {
  destination?: string
  duration?: string
  interests?: string
}

export interface UpdateItineraryData {
  ciudad_id?: number
  mensaje?: string
  fecha_viaje?: string
  intereses?: string
  duracion?: string
  resumen_itinerario?: string
  recomendacion?: string
  enlace_oficial?: string
}

/**
 * Buscar itinerarios con filtros
 */
export const searchItineraries = async (filters?: ItineraryFilters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters?.destination) params.append('destination', filters.destination)
    if (filters?.duration) params.append('duration', filters.duration)
    if (filters?.interests) params.append('interests', filters.interests)

    const response = await client.get(`/itinerario?${params.toString()}`)
    return response.data
  } catch (error: any) {
    console.error('Error searching itineraries:', error)
    throw error
  }
}

/**
 * Obtener un itinerario por ID
 */
export const getItineraryById = async (id: number) => {
  try {
    const response = await client.get(`/itinerario/${id}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching itinerary:', error)
    throw error
  }
}

/**
 * Actualizar un itinerario
 */
export const updateItinerary = async (id: number, itineraryData: UpdateItineraryData) => {
  try {
    const response = await client.put(`/itinerario/${id}`, itineraryData)
    return response.data
  } catch (error: any) {
    console.error('Error updating itinerary:', error)
    throw error
  }
}

/**
 * Guardar itinerario en el perfil del usuario
 */
export const saveItineraryToProfile = async (itinerarioId: number, usuarioId: number) => {
  try {
    const response = await client.post(`/itinerario/${itinerarioId}/save`, {
      usuario_id: usuarioId
    })
    return response.data
  } catch (error: any) {
    console.error('Error saving itinerary to profile:', error)
    throw error
  }
}

/**
 * Obtener itinerarios guardados del usuario
 */
export const getUserItineraries = async (usuarioId: number) => {
  try {
    const response = await client.get(`/itinerario/user/${usuarioId}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching user itineraries:', error)
    throw error
  }
}

/**
 * Eliminar itinerario del perfil del usuario
 */
export const deleteItineraryFromProfile = async (usuarioId: number, itinerarioId: number) => {
  try {
    const response = await client.delete(`/itinerario/${usuarioId}/${itinerarioId}`)
    return response.data
  } catch (error: any) {
    console.error('Error deleting itinerary from profile:', error)
    throw error
  }
}

