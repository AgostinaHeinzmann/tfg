import { Router } from "express"
import { actualizarFechaNacimiento, obtenerVerificacion, obtenerVerificacionCompleta } from "../controllers/verificacionIdentidadController";

const router = Router()
router.post("/actualizarFechaNacimiento", actualizarFechaNacimiento);
router.get("/obtenerVerificacion", obtenerVerificacion);
router.get("/obtenerVerificacionCompleta", obtenerVerificacionCompleta);
export default router
