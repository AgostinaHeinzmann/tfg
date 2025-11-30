import { Request, Response } from "express";
import { Event } from "../models/Event";
import { where, WhereOptions } from "sequelize";
import { Where } from "sequelize/types/utils";
import { Op } from "sequelize";
import Interes from "../models/Interes";
import Direccion from "../models/Direccion";
import { Ciudad } from "../models/Ciudad";
import Pais from "../models/Pais";
import MensajeEvent from "../models/MensajeEvent";
import InscripcionEvent from "../models/InscripcionEvent";
import EventUser from "../models/EventUser";
import { User } from "../models/User";

export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { location, interests, ageGroup, date, size = "10", page = "0" } = req.query;

    const ageGroups: { [key: number]: [number, number] } = {
      0: [0, 18],
      1: [18, 25],
      2: [25, 35],
      3: [35, 45],
      4: [45, 55],
    };

    // Construir el where clause
    let whereClause: any = {};

    // Añadir condiciones solo si los parámetros están presentes
    if (location && location !== '') {
      whereClause[Op.or] = {
        "$direccion.ciudad.pais.nombre$": location,
        "$direccion.ciudad.nombre$": location
      };
    }

    if (interests && interests !== '') {
      const interestsArray = (interests as string).split(",").filter(i => i.trim() !== '');
      if (interestsArray.length > 0) {
        whereClause["$intereses.tipo$"] = { [Op.in]: interestsArray };
      }
    }

    if (ageGroup && !isNaN(Number(ageGroup))) {
      const ageGroupNumber = Number(ageGroup);
      if (ageGroups[ageGroupNumber]) {
        whereClause.restriccion_edad = {
          [Op.gte]: ageGroups[ageGroupNumber][0],
          [Op.lte]: ageGroups[ageGroupNumber][1],
        };
      }
    }

    if (date && !isNaN(Date.parse(date as string))) {
      whereClause.fecha_inicio = { [Op.gte]: new Date(date as string) };
    }

    // Configurar paginación
    const pageSize = Math.min(Number(size), 50); // Limitar el tamaño máximo de página
    const offset = Math.max(0, Number(page)) * pageSize;

    const events = await Event.findAll({
      where: whereClause,
      offset,
      limit: pageSize,
      include: [
        {
          model: Interes,
          as: 'intereses',
          required: false
        },
        { 
          model: Direccion,
          required: false,
          include: [
            {
              model: Ciudad,
              required: false,
              include: [
                {
                  model: Pais,
                  required: false
                }
              ]
            }
          ]
        }
      ],
      order: [['fecha_inicio', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        pageSize,
        offset
      }
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching events",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    const event = await Event.findByPk(Number(id), {
      include: [
        {
          model: Interes,
          as: 'intereses',
          required: false
        },
        {
          model: Direccion,
          required: false,
          include: [
            {
              model: Ciudad,
              required: false,
              include: [
                {
                  model: Pais,
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: MensajeEvent,
          required: false,
          order: [['fecha_creacion', 'DESC']]
        },
        {
          model: InscripcionEvent,
          required: false
        },
        {
          model: EventUser,
          required: false
        },
        {
          model: User,
          required: false,
          attributes: {
            exclude: ['contrasena']
          }
        }
      ]
    });

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Error fetching event by ID:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching event",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log('Request body:', req.body);
  try {
    const { 
      nombre_evento, 
      descripcion_evento, 
      fecha_inicio, 
      horario, 
      duracion, 
      cant_participantes, 
      restriccion_edad,
      direccion_id,
      usuario_id,
      calle,
      numero,
      imagen_id
    } = req.body;

    // Validaciones básicas
    if (!nombre_evento || !usuario_id) {
      res.status(400).json({ 
        success: false, 
        message: "nombre_evento and usuario_id are required" 
      });
      return;
    }

    // Verificar que el usuario exista
    const userExists = await User.findByPk(usuario_id);
    if (!userExists) {
      res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
      return;
    }

    // Verificar que la dirección exista si se proporciona
    if (direccion_id) {
      const direccionExists = await Direccion.findByPk(direccion_id);
      if (!direccionExists) {
        res.status(404).json({ 
          success: false, 
          message: "Address not found" 
        });
        return;
      }
    }

    const newEvent = await Event.create({
      nombre_evento,
      descripcion_evento,
      fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
      horario,
      duracion,
      cant_participantes: cant_participantes ? Number(cant_participantes) : null,
      restriccion_edad: restriccion_edad ? Number(restriccion_edad) : null,
      direccion_id: direccion_id ? Number(direccion_id) : null,
      usuario_id: Number(usuario_id),
      calle,
      numero,
      imagen_id: imagen_id ? Number(imagen_id) : null
    } as any);

    // Crear automáticamente un mensaje inicial en el chat del evento
    await MensajeEvent.create({
      evento_id: newEvent.evento_id,
      mensaje: `Chat iniciado para el evento: ${nombre_evento}`,
      fecha_creacion: new Date()
    } as any);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent
    });

  } catch (error) {
    console.error('Error creating event:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error creating event",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Buscar el evento
    const event = await Event.findByPk(Number(id));
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    const { 
      nombre_evento, 
      descripcion_evento, 
      fecha_inicio, 
      horario, 
      duracion, 
      cant_participantes, 
      restriccion_edad,
      direccion_id,
      usuario_id,
      calle,
      numero,
      imagen_id
    } = req.body;

    // Verificar que el usuario exista si se proporciona
    if (usuario_id) {
      const userExists = await User.findByPk(usuario_id);
      if (!userExists) {
        res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
        return;
      }
    }

    // Verificar que la dirección exista si se proporciona
    if (direccion_id) {
      const direccionExists = await Direccion.findByPk(direccion_id);
      if (!direccionExists) {
        res.status(404).json({ 
          success: false, 
          message: "Address not found" 
        });
        return;
      }
    }

    // Actualizar solo los campos proporcionados
    await event.update({
      nombre_evento: nombre_evento ?? event.nombre_evento,
      descripcion_evento: descripcion_evento ?? event.descripcion_evento,
      fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : event.fecha_inicio,
      horario: horario ?? event.horario,
      duracion: duracion ?? event.duracion,
      cant_participantes: cant_participantes !== undefined ? Number(cant_participantes) : event.cant_participantes,
      restriccion_edad: restriccion_edad !== undefined ? Number(restriccion_edad) : event.restriccion_edad,
      direccion_id: direccion_id !== undefined ? Number(direccion_id) : event.direccion_id,
      usuario_id: usuario_id !== undefined ? Number(usuario_id) : event.usuario_id,
      calle: calle ?? event.calle,
      numero: numero ?? event.numero,
      imagen_id: imagen_id !== undefined ? Number(imagen_id) : event.imagen_id
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event
    });

  } catch (error) {
    console.error('Error updating event:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error updating event",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Buscar el evento
    const event = await Event.findByPk(Number(id));
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Eliminar el evento
    await event.destroy();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error deleting event",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getEventMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Verificar que el evento exista
    const event = await Event.findByPk(Number(id));
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Obtener todos los mensajes del evento
    const messages = await MensajeEvent.findAll({
      where: { evento_id: Number(id) },
      order: [['fecha_creacion', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching event messages:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching event messages",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const registerUserToEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;

    // Validar que el id del evento sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Validar que el usuario_id esté presente
    if (!usuario_id) {
      res.status(400).json({ success: false, message: "usuario_id is required" });
      return;
    }

    // Verificar que el evento exista
    const event = await Event.findByPk(Number(id));
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Verificar si el usuario ya está inscrito
    const existingInscription = await InscripcionEvent.findOne({
      where: { evento_id: Number(id), usuario_id: Number(usuario_id) }
    });

    if (existingInscription) {
      res.status(409).json({ success: false, message: "User is already registered to this event" });
      return;
    }

    // Crear la inscripción
    const inscription = await InscripcionEvent.create({
      evento_id: Number(id),
      usuario_id: Number(usuario_id),
      fecha_creacion: new Date()
    } as any);

    res.status(201).json({
      success: true,
      message: "User registered to event successfully",
      data: inscription
    });

  } catch (error) {
    console.error('Error registering user to event:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error registering user to event",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const unregisterUserFromEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, usuario_id } = req.params;

    // Validar que el id del evento sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Validar que el usuario_id esté presente
    if (!usuario_id || isNaN(Number(usuario_id))) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    // Verificar que el evento exista
    const event = await Event.findByPk(Number(id));
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Buscar la inscripción
    const inscription = await InscripcionEvent.findOne({
      where: { evento_id: Number(id), usuario_id: Number(usuario_id) }
    });

    if (!inscription) {
      res.status(404).json({ success: false, message: "User is not registered to this event" });
      return;
    }

    // Eliminar la inscripción
    await inscription.destroy();

    res.status(200).json({
      success: true,
      message: "User unregistered from event successfully"
    });

  } catch (error) {
    console.error('Error unregistering user from event:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error unregistering user from event",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
