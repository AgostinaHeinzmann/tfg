import { Router } from "express"

import { 
  getFeed, 
  getFeedById, 
  createFeed, 
  updateFeed, 
  deleteFeed,
  likePublication,
  commentPublication,
  deleteComment
} from "../controllers/feedController";

const router = Router()

// GET: Obtener feed con filtros
router.get("/", getFeed)

// GET: Obtener publicación por ID
router.get("/:id", getFeedById)

// POST: Crear publicación
router.post("/", createFeed)

// PUT: Actualizar publicación
router.put("/:id", updateFeed)

// DELETE: Eliminar publicación
router.delete("/:id", deleteFeed)

// POST: Agregar me gusta
router.post("/:id/like", likePublication)

// POST: Comentar en publicación
router.post("/:id/comment", commentPublication)

// DELETE: Eliminar comentario
router.delete("/comment/:comentario_id", deleteComment)

export default router
