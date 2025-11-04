import { Router } from "express"

import { getAllEvents, getEventById } from "../controllers/eventController";
const router = Router()




router.get("/", getFeed)
router.get("/:id", getFeedById)
router.post("/", createFeed)
router.put("/:id", updateFeed)
router.delete("/:id", deleteFeed)


export default router
