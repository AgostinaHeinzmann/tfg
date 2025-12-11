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

