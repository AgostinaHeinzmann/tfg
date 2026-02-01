import { client } from '../axios/axios.config'

export interface FeedFilters {
  ciudad_id?: number
  page?: number
  size?: number
  usuario_id?: number
}

export interface ImageData {
  base64: string
  mimeType: string
}

export interface CreateFeedData {
  usuario_id: number
  descripcion: string
  ciudad_id?: number
  imagenes?: ImageData[]
}

export interface UpdateFeedData {
  usuario_id: number
  descripcion?: string
  ciudad_id?: number
}

export interface CommentData {
  usuario_id: number
  mensaje: string
}

/**
 * Obtener feed con filtros opcionales
 */
export const getFeed = async (filters?: FeedFilters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters?.ciudad_id) params.append('ciudad_id', filters.ciudad_id.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.size) params.append('size', filters.size.toString())
    if (filters?.usuario_id) params.append('usuario_id', filters.usuario_id.toString())

    const response = await client.get(`/feed?${params.toString()}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching feed:', error)
    throw error
  }
}

/**
 * Obtener una publicación por ID
 */
export const getFeedById = async (id: number) => {
  try {
    const response = await client.get(`/feed/${id}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching publication:', error)
    throw error
  }
}

/**
 * Crear una nueva publicación
 */
export const createFeed = async (feedData: CreateFeedData) => {
  try {
    const response = await client.post('/feed', feedData)
    return response.data
  } catch (error: any) {
    console.error('Error creating publication:', error)
    throw error
  }
}

/**
 * Actualizar una publicación existente
 */
export const updateFeed = async (id: number, feedData: UpdateFeedData) => {
  try {
    const response = await client.put(`/feed/${id}`, feedData)
    return response.data
  } catch (error: any) {
    console.error('Error updating publication:', error)
    throw error
  }
}

/**
 * Eliminar una publicación
 */
export const deleteFeed = async (id: number, usuarioId: number) => {
  try {
    const config = {
      params: { usuario_id: usuarioId }
    }
    const response = await client.delete(`/feed/${id}`, config)
    return response.data
  } catch (error: any) {
    console.error('Error deleting publication:', error)
    throw error
  }
}
/**
 * Dar me gusta a una publicación
 */
export const likePublication = async (id: number, usuarioId: number) => {
  try {
    const response = await client.post(`/feed/${id}/like`, { usuario_id: usuarioId })
    return response.data
  } catch (error: any) {
    console.error('Error liking publication:', error)
    throw error
  }
}

/**
 * Comentar en una publicación
 */
export const commentPublication = async (id: number, commentData: CommentData) => {
  try {
    const response = await client.post(`/feed/${id}/comment`, commentData)
    return response.data
  } catch (error: any) {
    console.error('Error commenting publication:', error)
    throw error
  }
}

/**
/**
 * Eliminar un comentario
 */
export const deleteComment = async (comentarioId: number, usuarioId: number) => {
  try {
    const config = {
      params: { usuario_id: usuarioId }
    }
    const response = await client.delete(`/feed/comment/${comentarioId}`, config)
    return response.data
  } catch (error: any) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
