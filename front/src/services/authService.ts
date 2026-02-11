import { client } from '../axios/axios.config'

export interface RegisterData {
  nombre: string
  apellido: string
  email: string
  contrasena: string
  uid?: string
  imagen_perfil_id?: number
}

export interface LoginData {
  email: string
  contrasena: string
}

/**
 * Registrar usuario en el backend
 */
export const registerBackend = async (data: RegisterData) => {
  try {
    const response = await client.post('/auth/register', data)
    return response.data
  } catch (error: any) {
    console.error('Error registering user:', error)
    throw error
  }
}

/**
 * Iniciar sesión en el backend
 */
export const loginBackend = async (data: LoginData) => {
  try {
    const response = await client.post('/auth/login', data)
    return response.data
  } catch (error: any) {
    console.error('Error logging in:', error)
    throw error
  }
}

/**
 * Sincronizar usuario de Firebase con el backend
 */
export const syncUserBackend = async (data: {
  email: string,
  uid: string,
  nombre?: string,
  apellido?: string,
  imagen_perfil?: string
}) => {
  try {
    const response = await client.post('/auth/sync', data)
    return response.data
  } catch (error: any) {
    console.error('Error syncing user:', error)
    throw error
  }
}

/**
 * Actualizar perfil del usuario
 */
export const updateUserProfile = async (data: {
  nombre?: string,
  apellido?: string,
  imagen_perfil?: string
}) => {
  try {
    const response = await client.put('/users/profile', data)
    return response.data
  } catch (error: any) {
    console.error('Error updating profile:', error)
    throw error
  }
}

/**
 * Convierte un archivo a base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remover el prefijo "data:image/jpeg;base64," para obtener solo el base64
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * Subir imagen de perfil
 */
export const uploadProfileImage = async (file: File) => {
  try {
    const imageBase64 = await fileToBase64(file)
    const response = await client.post('/users/profile/image', {
      imageBase64,
      mimeType: file.type
    })
    return response.data
  } catch (error: any) {
    console.error('Error uploading profile image:', error)
    throw error
  }
}

/**
 * Obtener perfil del usuario actual
 */
export const getUserProfile = async () => {
  try {
    const response = await client.get('/users/profile')
    return response.data
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    throw error
  }
}
