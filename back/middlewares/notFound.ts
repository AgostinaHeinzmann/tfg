import type { Request, Response } from "express"
import type { ApiResponse } from "../types/api"

const notFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
  }

  res.status(404).json(response)
}

export default notFound
