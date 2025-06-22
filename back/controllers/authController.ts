import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"
import { User } from "../models"
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth"
import type { ApiResponse } from "../types/api"
import type { UserAttributes } from "../models/User"

class AuthController {
  // Generar JWT token
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })
  }

  // Registro de usuario
  public async register(
    req: Request<{}, AuthResponse, RegisterRequest>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const response: AuthResponse = {
          success: false,
          message: "Errores de validación",
        }
        res.status(400).json(response)
        return
      }

      const { firstName, lastName, email, password } = req.body

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        const response: AuthResponse = {
          success: false,
          message: "El email ya está registrado",
        }
        res.status(409).json(response)
        return
      }

      // Crear nuevo usuario
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
      })

      // Generar token
      const token = this.generateToken(user.id)

      const response: AuthResponse = {
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          user: user.toJSON(),
          token,
        },
      }

      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Login de usuario
  public async login(req: Request<{}, AuthResponse, LoginRequest>, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const response: AuthResponse = {
          success: false,
          message: "Errores de validación",
        }
        res.status(400).json(response)
        return
      }

      const { email, password } = req.body

      // Buscar usuario por email
      const user = await User.findOne({ where: { email } })
      if (!user) {
        const response: AuthResponse = {
          success: false,
          message: "Credenciales inválidas",
        }
        res.status(401).json(response)
        return
      }

      // Verificar contraseña
      const isPasswordValid = await user.checkPassword(password)
      if (!isPasswordValid) {
        const response: AuthResponse = {
          success: false,
          message: "Credenciales inválidas",
        }
        res.status(401).json(response)
        return
      }

      // Actualizar último login
      await user.update({ lastLogin: new Date() })

      // Generar token
      const token = this.generateToken(user.id)

      const response: AuthResponse = {
        success: true,
        message: "Login exitoso",
        data: {
          user: user.toJSON(),
          token,
        },
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Obtener perfil del usuario autenticado
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(req.user!.id, {
        attributes: { exclude: ["password"] },
      })

      const response: ApiResponse<UserAttributes> = {
        success: true,
        message: "Perfil obtenido exitosamente",
        data: user!.toJSON() as UserAttributes,
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Actualizar perfil
  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        }
        res.status(400).json(response)
        return
      }

      const { firstName, lastName } = req.body
      const user = await User.findByPk(req.user!.id)

      await user!.update({ firstName, lastName })

      const response: ApiResponse<UserAttributes> = {
        success: true,
        message: "Perfil actualizado exitosamente",
        data: user!.toJSON() as UserAttributes,
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()
