import { Router } from "express"

import { 
  searchItineraries, 
  getItineraryById, 
  getItineraryDays,
  updateItinerary, 
  saveItineraryToProfile, 
  getUserItineraries, 
  deleteItineraryFromProfile,
  getPopularItineraries
} from "../controllers/itinerarioController";

const router = Router()

// Búsqueda de itinerarios con filtros
router.get("/", searchItineraries)

// Obtener itinerarios populares (debe ir ANTES de /:id)
router.get("/popular", getPopularItineraries)

// Obtener los días de un itinerario (debe ir ANTES de /:id)
router.get("/:id/dias", getItineraryDays)

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
