export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: any
    token: string
  }
}

export interface JwtPayload {
  userId: string
  iat?: number
  exp?: number
}
