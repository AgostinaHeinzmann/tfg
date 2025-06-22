import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { Op } from "sequelize"
import { User } from "../models"
import type { ApiResponse, PaginationQuery, PaginatedResponse } from "../types/api"
import type { UserAttributes } from "../models/User"

class UserController {
  // Obtener todos los usuarios
  public async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10", search, role }: PaginationQuery & { role?: string } = req.query
      const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)

      const whereClause: any = {}

      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ]
      }

      if (role) {
        whereClause.role = role
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        order: [["createdAt", "DESC"]],
        attributes: { exclude: ["password"] },
      })

      const response: ApiResponse<PaginatedResponse<UserAttributes>> = {
        success: true,
        message: "Usuarios obtenidos exitosamente",
        data: {
          items: users.map((user) => user.toJSON() as UserAttributes),
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages: Math.ceil(count / Number.parseInt(limit)),
            totalItems: count,
            itemsPerPage: Number.parseInt(limit),
          },
        },
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Obtener usuario por ID
  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params

      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      })

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "Usuario no encontrado",
        }
        res.status(404).json(response)
        return
      }

      const response: ApiResponse<UserAttributes> = {
        success: true,
        message: "Usuario obtenido exitosamente",
        data: user.toJSON() as UserAttributes,
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Crear nuevo usuario
  public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { firstName, lastName, email, password, role } = req.body

      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: "El email ya está registrado",
        }
        res.status(409).json(response)
        return
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
      })

      const response: ApiResponse<UserAttributes> = {
        success: true,
        message: "Usuario creado exitosamente",
        data: user.toJSON() as UserAttributes,
      }

      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Actualizar usuario
  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { id } = req.params
      const updateData = req.body

      const user = await User.findByPk(id)
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "Usuario no encontrado",
        }
        res.status(404).json(response)
        return
      }

      await user.update(updateData)

      const response: ApiResponse<UserAttributes> = {
        success: true,
        message: "Usuario actualizado exitosamente",
        data: user.toJSON() as UserAttributes,
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Eliminar usuario
  public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params

      const user = await User.findByPk(id)
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "Usuario no encontrado",
        }
        res.status(404).json(response)
        return
      }

      await user.destroy()

      const response: ApiResponse = {
        success: true,
        message: "Usuario eliminado exitosamente",
      }

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}

export default new UserController()
