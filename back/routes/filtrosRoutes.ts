import { Router } from "express"

import { getFilters, getCiudadesByPais } from "../controllers/filtrosController";
const router = Router()

router.get("/", getFilters)
router.get("/ciudades/pais/:pais_id", getCiudadesByPais)

export default router
