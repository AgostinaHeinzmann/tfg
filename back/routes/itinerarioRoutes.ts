import { Router } from "express"

import { 
  searchItineraries, 
  getItineraryById, 
  updateItinerary, 
  saveItineraryToProfile, 
  getUserItineraries, 
  deleteItineraryFromProfile 
} from "../controllers/itinerarioController";

const router = Router()

// Búsqueda de itinerarios con filtros
router.get("/", searchItineraries)

// Obtener un itinerario por ID
router.get("/:id", getItineraryById)

// Actualizar itinerario
router.put("/:id", updateItinerary)

// Guardar itinerario en perfil del usuario
router.post("/:itinerario_id/save", saveItineraryToProfile)

// Obtener itinerarios guardados del usuario
router.get("/user/:usuario_id", getUserItineraries)

// Eliminar itinerario del perfil del usuario
router.delete("/:usuario_id/:itinerario_id", deleteItineraryFromProfile)

export default router
