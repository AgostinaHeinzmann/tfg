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
