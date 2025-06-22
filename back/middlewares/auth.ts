import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models"
import type { JwtPayload } from "../types/auth"
import type { ApiResponse } from "../types/api"

const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: "Token de acceso requerido",
      }
      res.status(401).json(response)
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload
    const user = await User.findByPk(decoded.userId)

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: "Token inválido",
      }
      res.status(401).json(response)
      return
    }

    req.user = user.toJSON()
    next()
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Token inválido",
    }
    res.status(401).json(response)
  }
}

export default auth
