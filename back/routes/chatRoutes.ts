import { Router } from "express"
import { 
  getUserChats, 
  getChatMessages, 
  sendChatMessage, 
  markChatAsRead,
  getUnreadCount 
} from "../controllers/chatController"

const router = Router()

// Obtener todos los chats del usuario con conteo de no leídos
router.get("/", getUserChats)

// Obtener conteo total de mensajes no leídos
router.get("/unread", getUnreadCount)

// Obtener mensajes de un chat específico (con info del evento y participantes)
router.get("/:id/messages", getChatMessages)

// Enviar mensaje a un chat
router.post("/:id/message", sendChatMessage)

// Marcar chat como leído
router.post("/:id/read", markChatAsRead)

export default router
