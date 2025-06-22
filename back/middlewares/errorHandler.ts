import type { Request, Response, NextFunction } from "express"
import type { ApiResponse } from "../types/api"

interface CustomError extends Error {
  status?: number
  name: string
  errors?: any[]
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error("Error:", err)

  // Error de validación de Sequelize
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors?.map((error: any) => ({
      field: error.path,
      message: error.message,
    }))

    const response: ApiResponse = {
      success: false,
      message: "Errores de validación",
      errors,
    }

    res.status(400).json(response)
    return
  }

  // Error de clave única de Sequelize
  if (err.name === "SequelizeUniqueConstraintError") {
    const response: ApiResponse = {
      success: false,
      message: "El recurso ya existe",
    }

    res.status(409).json(response)
    return
  }

  // Error de clave foránea de Sequelize
  if (err.name === "SequelizeForeignKeyConstraintError") {
    const response: ApiResponse = {
      success: false,
      message: "Referencia inválida",
    }

    res.status(400).json(response)
    return
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    const response: ApiResponse = {
      success: false,
      message: "Token inválido",
    }

    res.status(401).json(response)
    return
  }

  // Error de JWT expirado
  if (err.name === "TokenExpiredError") {
    const response: ApiResponse = {
      success: false,
      message: "Token expirado",
    }

    res.status(401).json(response)
    return
  }

  // Error genérico del servidor
  const response: ApiResponse = {
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { errors: [{ stack: err.stack }] }),
  }

  res.status(err.status || 500).json(response)
}

export default errorHandler
