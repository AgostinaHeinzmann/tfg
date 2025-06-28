import { Router } from "express"
import authController from "../controllers/authController"
import auth from "../middlewares/auth"

const router = Router()

// Validaciones
const registerValidation = [
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres"),
  body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
]

const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres"),
]

// Rutas
router.post("/register", registerValidation, authController.register)
router.post("/login", loginValidation, authController.login)
router.get("/profile", auth, authController.getProfile)
router.put("/profile", auth, updateProfileValidation, authController.updateProfile)

export default router
