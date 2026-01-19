import { Router } from "express"

import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getEventMessages, sendEventMessage, registerUserToEvent, unregisterUserFromEvent, getUserEvents } from "../controllers/eventController";
const router = Router()




router.get("/", getAllEvents)
router.get("/:id/messages", getEventMessages)
router.get("/:id", getEventById)
router.post("/", createEvent)
router.post("/:id/message", sendEventMessage);
router.get("/user/:usuario_id", getUserEvents);
router.post("/:id/register", registerUserToEvent)
router.put("/:id", updateEvent)
router.delete("/:id/register/:usuario_id", unregisterUserFromEvent)
router.delete("/:id", deleteEvent)


export default router
