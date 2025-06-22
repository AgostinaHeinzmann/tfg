import type { Request, Response, NextFunction } from "express"
import type { ApiResponse } from "../types/api"

const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    const response: ApiResponse = {
      success: false,
      message: "Acceso denegado. Se requieren permisos de administrador.",
    }
    res.status(403).json(response)
  }
}

export default adminAuth
