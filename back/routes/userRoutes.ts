import { Router } from "express"
import { body } from "express-validator"
import userController from "../controllers/userController"
import auth from "../middlewares/auth"
import adminAuth from "../middlewares/adminAuth"

const router = Router()

// Validaciones
const createUserValidation = [
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres"),
  body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("role").optional().isIn(["user", "admin"]).withMessage("El rol debe ser user o admin"),
]

const updateUserValidation = [
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
  body("email").optional().isEmail().normalizeEmail().withMessage("Debe ser un email válido"),
  body("role").optional().isIn(["user", "admin"]).withMessage("El rol debe ser user o admin"),
]

// Rutas
router.get("/", auth, adminAuth, userController.getAllUsers)
router.get("/:id", auth, userController.getUserById)
router.post("/", auth, adminAuth, createUserValidation, userController.createUser)
router.put("/:id", auth, adminAuth, updateUserValidation, userController.updateUser)
router.delete("/:id", auth, adminAuth, userController.deleteUser)

export default router
