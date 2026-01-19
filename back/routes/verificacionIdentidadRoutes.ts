import { Router } from "express"
import { actualizarFechaNacimiento,obtenerVerificacion  } from "../controllers/verificacionIdentidadController";
import {
} from "../controllers/verificacionIdentidadController";

const router = Router()
router.post("/actualizarFechaNacimiento", actualizarFechaNacimiento);
router.get("/obtenerVerificacion", obtenerVerificacion);
export default router
