import { client } from '../axios/axios.config'

export interface ItineraryFilters {
  destination?: string
  duration?: string
  interests?: string
  ciudad_id?: number
  pais_id?: number
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

export interface CreateItineraryData {
  destination: string
  duration: number
  interests: string[]
  description?: string
  coverImage?: string
  days?: ItineraryDay[]
}

export interface ItineraryActivity {
  title: string
  description: string
  location: string
  address: string
  coordinates: [number, number]
  time: string
  duration: string
  price?: number | null
  ticketUrl?: string
  imageUrl?: string
  rating?: number
  type: "museo" | "atracción" | "transporte" | "descanso"
}

export interface ItineraryDay {
  day: number
  activities: ItineraryActivity[]
}

/**
 * Buscar itinerarios con filtros
 * Prioridad de filtros de ubicación: ciudad_id > pais_id > destination
 */
export const searchItineraries = async (filters?: ItineraryFilters) => {
  try {
    const params = new URLSearchParams()
    
    // Filtros de ubicación (prioridad: ciudad_id > pais_id > destination)
    if (filters?.ciudad_id) {
      params.append('ciudad_id', filters.ciudad_id.toString())
    } else if (filters?.pais_id) {
      params.append('pais_id', filters.pais_id.toString())
    } else if (filters?.destination) {
      params.append('destination', filters.destination)
    }
    
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

/**
 * Crear un nuevo itinerario
 */
export const createItinerary = async (itineraryData: CreateItineraryData) => {
  try {
    const response = await client.post('/itinerario', itineraryData)
    return response.data
  } catch (error: any) {
    console.error('Error creating itinerary:', error)
    throw error
  }
}

/**
 * Obtener itinerarios populares/recomendados
 */
export const getPopularItineraries = async (limit: number = 6) => {
  try {
    const response = await client.get(`/itinerario/popular?limit=${limit}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching popular itineraries:', error)
    throw error
  }
}

/**
 * Obtener los días y actividades de un itinerario
 */
export const getItineraryDays = async (itinerarioId: number) => {
  try {
    const response = await client.get(`/itinerario/${itinerarioId}/dias`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching itinerary days:', error)
    throw error
  }
}