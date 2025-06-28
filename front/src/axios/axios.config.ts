import axios from 'axios'
import { auth } from '../../firebase/firebase.config'

const apiUrl = import.meta.env.VITE_API_URL

export const client = axios.create({
  baseURL: apiUrl,
})

// Interceptor para agregar el Authorization Bearer token
client.interceptors.request.use(
  (config) => {
    const user = auth.currentUser
    if (user) {
      // Nota: Esto es síncrono, así que solo funcionará si el usuario ya tiene un token en caché
      user.getIdToken(/* forceRefresh */ false).then(token => {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      })
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