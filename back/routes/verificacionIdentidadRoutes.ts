import { Router } from "express"

import { 
  iniciarVerificacionEscaneo,
  iniciarVerificacionImagen,
  obtenerEstadoVerificacion,
  aprobarVerificacion,
  rechazarVerificacion,
  listarVerificacionesPendientes,
  verificarIdentidadMiddleware
} from "../controllers/verificacionIdentidadController";

const router = Router()

// POST: Iniciar verificación por escaneo
router.post("/escaneo", iniciarVerificacionEscaneo)

// POST: Iniciar verificación por subida de imagen
router.post("/imagen", iniciarVerificacionImagen)

// GET: Obtener estado de verificación del usuario
router.get("/estado/:usuario_id", obtenerEstadoVerificacion)

// GET: Listar verificaciones pendientes (Admin)
router.get("/pendientes", listarVerificacionesPendientes)

// PUT: Aprobar verificación (Admin)
router.put("/:verificacion_id/aprobar", aprobarVerificacion)

// PUT: Rechazar verificación (Admin)
router.put("/:verificacion_id/rechazar", rechazarVerificacion)

export default router
