import { Request, Response } from "express";
import { Op } from "sequelize";
import Itinerary from "../models/Itinerario";
import ItinerarioUser from "../models/ItinerarioUser";
import ItinerarioDia from "../models/ItinerarioDia";
import Ciudad from "../models/Ciudad";
import Pais from "../models/Pais";
import Direccion from "../models/Direccion";
import { User } from "../models/User";

export const searchItineraries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { destination, duration, interests } = req.query;

    // Construir el where clause
    let whereClause: any = {};

    // Filtrar por ciudad (destino)
    if (destination && destination !== '') {
      whereClause['$ciudad.nombre$'] = { [Op.iLike]: `%${destination}%` };
    }

    // Filtrar por duración
    if (duration && duration !== '') {
      whereClause.duracion = { [Op.iLike]: `%${duration}%` };
    }

    // Filtrar por intereses
    if (interests && interests !== '') {
      const interestsArray = (interests as string).split(",").filter(i => i.trim() !== '');
      if (interestsArray.length > 0) {
        whereClause.intereses = { [Op.or]: interestsArray.map(i => ({ [Op.iLike]: `%${i.trim()}%` })) };
      }
    }

    // Obtener itinerarios con filtros
    const itineraries = await Itinerary.findAll({
      where: whereClause,
      include: [
        {
          model: Ciudad,
          required: !!destination,
          include: [
            {
              model: Pais,
              required: false
            }
          ]
        },
        {
          model: ItinerarioDia,
          required: false,
          include: [
            {
              model: Direccion,
              required: false
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: itineraries
    });

  } catch (error) {
    console.error('Error searching itineraries:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error searching itineraries",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getItineraryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid itinerary ID" });
      return;
    }

    const itinerary = await Itinerary.findByPk(Number(id), {
      include: [
        {
          model: Ciudad,
          include: [
            {
              model: Pais
            }
          ]
        },
        {
          model: ItinerarioDia,
          include: [
            {
              model: Direccion
            }
          ]
        },
        {
          model: User,
          attributes: {
            exclude: ['contrasena']
          }
        }
      ]
    });

    if (!itinerary) {
      res.status(404).json({ success: false, message: "Itinerary not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: itinerary
    });

  } catch (error) {
    console.error('Error fetching itinerary by ID:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching itinerary",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updateItinerary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      ciudad_id,
      mensaje,
      fecha_viaje,
      intereses,
      duracion,
      resumen_itinerario,
      recomendacion,
      enlace_oficial
    } = req.body;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid itinerary ID" });
      return;
    }

    // Buscar el itinerario
    const itinerary = await Itinerary.findByPk(Number(id));
    if (!itinerary) {
      res.status(404).json({ success: false, message: "Itinerary not found" });
      return;
    }

    // Verificar que la ciudad exista si se proporciona
    if (ciudad_id) {
      const cityExists = await Ciudad.findByPk(ciudad_id);
      if (!cityExists) {
        res.status(404).json({ success: false, message: "City not found" });
        return;
      }
    }

    // Actualizar solo los campos proporcionados
    await itinerary.update({
      ciudad_id: ciudad_id ?? itinerary.ciudad_id,
      mensaje: mensaje ?? itinerary.mensaje,
      fecha_viaje: fecha_viaje ? new Date(fecha_viaje) : itinerary.fecha_viaje,
      intereses: intereses ?? itinerary.intereses,
      duracion: duracion ?? itinerary.duracion,
      resumen_itinerario: resumen_itinerario ?? itinerary.resumen_itinerario,
      recomendacion: recomendacion ?? itinerary.recomendacion,
      enlace_oficial: enlace_oficial ?? itinerary.enlace_oficial
    });

    res.status(200).json({
      success: true,
      message: "Itinerary updated successfully",
      data: itinerary
    });

  } catch (error) {
    console.error('Error updating itinerary:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error updating itinerary",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const saveItineraryToProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itinerario_id } = req.params;
    const { usuario_id } = req.body;

    // Validar que el itinerario_id sea un número válido
    if (!itinerario_id || isNaN(Number(itinerario_id))) {
      res.status(400).json({ success: false, message: "Invalid itinerary ID" });
      return;
    }

    // Validar que el usuario_id esté presente
    if (!usuario_id) {
      res.status(400).json({ success: false, message: "usuario_id is required" });
      return;
    }

    // Verificar que el itinerario exista
    const itinerary = await Itinerary.findByPk(Number(itinerario_id));
    if (!itinerary) {
      res.status(404).json({ success: false, message: "Itinerary not found" });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Verificar si el itinerario ya está guardado por el usuario
    const existingSave = await ItinerarioUser.findOne({
      where: { itinerario_id: Number(itinerario_id), usuario_id: Number(usuario_id) }
    });

    if (existingSave) {
      res.status(409).json({ success: false, message: "Itinerary is already saved to user profile" });
      return;
    }

    // Guardar el itinerario en el perfil del usuario
    const save = await ItinerarioUser.create({
      itinerario_id: Number(itinerario_id),
      usuario_id: Number(usuario_id)
    } as any);

    res.status(201).json({
      success: true,
      message: "Itinerary saved to profile successfully",
      data: save
    });

  } catch (error) {
    console.error('Error saving itinerary to profile:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error saving itinerary to profile",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getUserItineraries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { usuario_id } = req.params;

    // Validar que el usuario_id sea un número válido
    if (!usuario_id || isNaN(Number(usuario_id))) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(Number(usuario_id));
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Obtener los itinerarios guardados del usuario
    const userItineraries = await ItinerarioUser.findAll({
      where: { usuario_id: Number(usuario_id) },
      include: [
        {
          model: Itinerary,
          include: [
            {
              model: Ciudad,
              include: [
                {
                  model: Pais
                }
              ]
            },
            {
              model: ItinerarioDia,
              include: [
                {
                  model: Direccion
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: userItineraries
    });

  } catch (error) {
    console.error('Error fetching user itineraries:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching user itineraries",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const deleteItineraryFromProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { usuario_id, itinerario_id } = req.params;

    // Validar que los ids sean números válidos
    if (!usuario_id || isNaN(Number(usuario_id))) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    if (!itinerario_id || isNaN(Number(itinerario_id))) {
      res.status(400).json({ success: false, message: "Invalid itinerary ID" });
      return;
    }

    // Buscar el registro de itinerario del usuario
    const save = await ItinerarioUser.findOne({
      where: { usuario_id: Number(usuario_id), itinerario_id: Number(itinerario_id) }
    });

    if (!save) {
      res.status(404).json({ success: false, message: "Itinerary not found in user profile" });
      return;
    }

    // Eliminar el itinerario del perfil del usuario
    await save.destroy();

    res.status(200).json({
      success: true,
      message: "Itinerary deleted from profile successfully"
    });

  } catch (error) {
    console.error('Error deleting itinerary from profile:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error deleting itinerary from profile",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
