import { Router } from "express"
import { updateProfile, uploadProfileImage, getProfile } from "../controllers/authController";
const router = Router()

// Rutas de perfil de usuario (requieren autenticación - el middleware auth ya está aplicado globalmente)
router.get("/profile", getProfile)
router.put("/profile", updateProfile)
router.post("/profile/image", uploadProfileImage)

export default router
