import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import Itinerary from "../models/Itinerario";
import ItinerarioUser from "../models/ItinerarioUser";
import ItinerarioDia from "../models/ItinerarioDia";
import Ciudad from "../models/Ciudad";
import Pais from "../models/Pais";
import Direccion from "../models/Direccion";
import { User } from "../models/User";

export const getPopularItineraries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = 3; 

    const itineraries = await Itinerary.findAll({
      where: {
        itinerarios_populares: true
      },
      include: [
        {
          model: Ciudad,
          as: 'ciudad',
          required: true,
          include: [
            {
              model: Pais,
              as: 'pais',
              required: false
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
          attributes: { exclude: ['contrasena'] },
          required: false
        }
      ],
      order: Sequelize.literal('RANDOM()'),
      limit: limit
    });

    res.status(200).json({
      success: true,
      data: itineraries,
      count: itineraries.length
    });

  } catch (error) {
    console.error('Error fetching popular itineraries:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular itineraries",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const searchItineraries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { destination, ciudad_id, pais_id, duration, interests } = req.query;

    // Construir el where clause
    let whereClause: any = {};

    // Filtrar por ubicación - prioridad: ciudad_id > pais_id > destination (texto)
    if (ciudad_id && ciudad_id !== '') {
      // Búsqueda por ciudad_id específico (dropdown)
      const ciudadIdNum = parseInt(ciudad_id as string, 10);
      if (!isNaN(ciudadIdNum)) {
        whereClause.ciudad_id = ciudadIdNum;
      }
    } else if (pais_id && pais_id !== '') {
      // Búsqueda por pais_id - buscar todas las ciudades del país
      const paisIdNum = parseInt(pais_id as string, 10);
      if (!isNaN(paisIdNum)) {
        whereClause['$ciudad.pais_id$'] = paisIdNum;
      }
    } else if (destination && destination !== '') {
      // Búsqueda por texto (nombre de ciudad o país)
      whereClause[Op.or] = [
        { '$ciudad.nombre$': { [Op.iLike]: `%${destination}%` } },
        { '$ciudad.pais.nombre$': { [Op.iLike]: `%${destination}%` } }
      ];
    }

    // Filtrar por duración (busca itinerarios con duración <= a la solicitada o cercana)
    if (duration && duration !== '') {
      const durationNum = parseInt(duration as string, 10);
      if (!isNaN(durationNum)) {
        // Buscar por el número de días (la duración puede ser "5", "5 days", "5 días", etc.)
        whereClause[Op.and] = [
          ...(whereClause[Op.and] || []),
          Sequelize.where(
            Sequelize.cast(
              Sequelize.fn('REGEXP_REPLACE', Sequelize.col('duracion'), '[^0-9]', '', 'g'),
              'INTEGER'
            ),
            { [Op.lte]: durationNum }
          )
        ];
      }
    }

    // Filtrar por intereses (busca coincidencias parciales)
    if (interests && interests !== '') {
      const interestsArray = (interests as string).split(",").filter(i => i.trim() !== '');
      if (interestsArray.length > 0) {
        // Buscar itinerarios que contengan AL MENOS uno de los intereses
        whereClause[Op.and] = [
          ...(whereClause[Op.and] || []),
          {
            [Op.or]: interestsArray.map(i => ({
              intereses: { [Op.iLike]: `%${i.trim()}%` }
            }))
          }
        ];
      }
    }

    // Obtener itinerarios con filtros
    const itineraries = await Itinerary.findAll({
      where: whereClause,
      include: [
        {
          model: Ciudad,
          as: 'ciudad',
          required: true,
          include: [
            {
              model: Pais,
              as: 'pais',
              required: false
            }
          ]
        },
        {
          model: ItinerarioDia,
          as: 'itinerariosDia',
          required: false,
          include: [
            {
              model: Direccion,
              as: 'direccion',
              required: false
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
          attributes: { exclude: ['contrasena'] },
          required: false
        }
      ],
      order: [
        ['itinerarios_populares', 'DESC'], // Primero los populares
        ['itinerario_id', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      data: itineraries,
      count: itineraries.length
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

export const getItineraryDays = async (
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

    // Verificar que el itinerario exista
    const itinerary = await Itinerary.findByPk(Number(id));
    if (!itinerary) {
      res.status(404).json({ success: false, message: "Itinerary not found" });
      return;
    }

    // Obtener los días del itinerario
    const days = await ItinerarioDia.findAll({
      where: { itinerario_id: Number(id) },
      include: [
        {
          model: Direccion,
          as: 'direccion'
        }
      ],
      order: [['itinerario_por_dia_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: days,
      count: days.length
    });

  } catch (error) {
    console.error('Error fetching itinerary days:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching itinerary days",
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
          as: 'ciudad',
          include: [
            {
              model: Pais,
              as: 'pais'
            }
          ]
        },
        {
          model: ItinerarioDia,
          as: 'itinerariosDia',
          include: [
            {
              model: Direccion,
              as: 'direccion'
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
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

    // Transformar la respuesta para que sea más amigable
    const formattedItineraries = userItineraries.map((ui: any) => {
      const plain = ui.get({ plain: true });
      return {
        usuario_id: plain.usuario_id,
        itinerario_id: plain.itinerario_id,
        itinerario: plain.itinerario || plain.Itinerary || null
      };
    });

    res.status(200).json({
      success: true,
      data: formattedItineraries
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
