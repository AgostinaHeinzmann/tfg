import axios from 'axios'
import { auth } from '../../firebase/firebase.config'

const apiUrl = import.meta.env.VITE_API_URL

export const client = axios.create({
  baseURL: apiUrl,
})

// Promise que se resuelve cuando el usuario está autenticado
let authReady: Promise<void> = new Promise((resolve) => {
  const unsubscribe = auth.onAuthStateChanged(() => {
    unsubscribe()
    resolve()
  })
})

// Interceptor para agregar el Authorization Bearer token
client.interceptors.request.use(
  async (config: any) => {
    // Esperar a que Firebase esté listo
    await authReady
    
    const user = auth.currentUser
    if (user) {
      try {
        const token = await user.getIdToken(true)
        if (!config.headers) {
          config.headers = {}
        }
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        console.error('Error getting Firebase token:', error)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar expiración del token (opcional, Firebase lo renueva automáticamente)
// Si tu backend devuelve 401 por token expirado, puedes intentar forzar refresh y reintentar la request aquí.
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      error.response.status === 401 &&
      auth.currentUser &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      // Fuerza refresh del token
      const token = await auth.currentUser.getIdToken(true)
      originalRequest.headers['Authorization'] = `Bearer ${token}`
      return client(originalRequest)
    }
    return Promise.reject(error)
  }
)