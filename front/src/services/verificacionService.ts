import { client } from '../axios/axios.config'

export interface VerificacionEscaneoData {
  usuario_id: number
  imagen_base64: string
  edad_extraida?: number
  numero_documento?: string
}

export interface VerificacionImagenData {
  usuario_id: number
  imagen_base64: string
}

export interface RechazarVerificacionData {
  razon_rechazo: string
}

/**
 * Iniciar verificación por escaneo de DNI
 */
export const iniciarVerificacionEscaneo = async (data: VerificacionEscaneoData) => {
  try {
    const response = await client.post('/verificacion/escaneo', data)
    return response.data
  } catch (error: any) {
    console.error('Error initiating scan verification:', error)
    throw error
  }
}

/**
 * Iniciar verificación por subida de imagen
 */
export const iniciarVerificacionImagen = async (data: VerificacionImagenData) => {
  try {
    const response = await client.post('/verificacion/imagen', data)
    return response.data
  } catch (error: any) {
    console.error('Error initiating upload verification:', error)
    throw error
  }
}

/**
 * Obtener estado de verificación del usuario
 */
export const obtenerEstadoVerificacion = async (usuarioId: number) => {
  try {
    const response = await client.get(`/verificacion/estado/${usuarioId}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching verification status:', error)
    throw error
  }
}

/**
 * Listar verificaciones pendientes (Admin)
 */
export const listarVerificacionesPendientes = async (page?: number, size?: number) => {
  try {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (size) params.append('size', size.toString())

    const response = await client.get(`/verificacion/pendientes?${params.toString()}`)
    return response.data
  } catch (error: any) {
    console.error('Error listing pending verifications:', error)
    throw error
  }
}

/**
 * Aprobar verificación (Admin)
 */
export const aprobarVerificacion = async (verificacionId: number) => {
  try {
    const response = await client.put(`/verificacion/${verificacionId}/aprobar`)
    return response.data
  } catch (error: any) {
    console.error('Error approving verification:', error)
    throw error
  }
}

/**
 * Rechazar verificación (Admin)
 */
export const rechazarVerificacion = async (verificacionId: number, data: RechazarVerificacionData) => {
  try {
    const response = await client.put(`/verificacion/${verificacionId}/rechazar`, data)
    return response.data
  } catch (error: any) {
    console.error('Error rejecting verification:', error)
    throw error
  }
}

/**
 * Convertir archivo a base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remover el prefijo "data:image/...;base64,"
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}

