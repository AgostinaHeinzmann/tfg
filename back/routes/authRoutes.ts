import { Router } from "express"
import { register, login, syncUser } from "../controllers/authController";
const router = Router()



// Rutas
router.post("/register", register)
router.post("/login", login)
router.post("/sync", syncUser)

export default router
