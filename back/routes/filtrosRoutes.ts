import { Router } from "express"

import { getFilters } from "../controllers/filtrosController";
const router = Router()

router.get("/", getFilters)

export default router
