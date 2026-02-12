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
import ChatUsuarioLectura from "../models/ChatUsuarioLectura";

// Función para obtener rango de fechas según el filtro
const getDateRange = (dateFilter: string): { start: Date; end: Date } | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (dateFilter) {
    case 'today':
      // Desde el inicio de hoy hasta el final de hoy
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return { start: today, end: endOfToday };
    
    case 'week':
      // Desde hoy hasta el final de la semana (próximo domingo)
      const endOfWeek = new Date(today);
      const daysUntilSunday = 7 - today.getDay();
      endOfWeek.setDate(today.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);
      return { start: today, end: endOfWeek };
    
    case 'month':
      // Desde hoy hasta el final del mes
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return { start: today, end: endOfMonth };
    
    default:
      return null;
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { location, ciudad_id, pais_id, interests, ageGroup, date, size = "10", page = "0", usuario_id } = req.query;

    const ageGroups: { [key: number]: [number, number] } = {
      0: [0, 18],
      1: [18, 25],
      2: [25, 35],
      3: [35, 45],
      4: [45, 55],
    };

    // Construir el where clause
    let whereClause: any = {};

    // Por defecto, solo mostrar eventos futuros (fecha_inicio >= hoy) o sin fecha
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Filtrar por fecha - soporta 'today', 'week', 'month' o una fecha específica
    if (date) {
      const dateStr = date as string;
      const dateRange = getDateRange(dateStr);
      
      if (dateRange) {
        // Es un filtro predefinido (today, week, month)
        whereClause.fecha_inicio = {
          [Op.gte]: dateRange.start,
          [Op.lte]: dateRange.end
        };
      } else if (!isNaN(Date.parse(dateStr))) {
        // Es una fecha específica en formato yyyy-mm-dd
        whereClause.fecha_inicio = { [Op.gte]: new Date(dateStr) };
      }
    } else {
      // Filtro por defecto: solo eventos futuros o sin fecha definida
      whereClause[Op.or] = [
        { fecha_inicio: { [Op.gte]: todayStart } },
        { fecha_inicio: { [Op.is]: null } }
      ];
    }

    // Añadir condiciones solo si los parámetros están presentes
    if (ageGroup && !isNaN(Number(ageGroup))) {
      const ageGroupNumber = Number(ageGroup);
      if (ageGroups[ageGroupNumber]) {
        whereClause.restriccion_edad = {
          [Op.gte]: ageGroups[ageGroupNumber][0],
          [Op.lte]: ageGroups[ageGroupNumber][1],
        };
      }
    }

    // Determinar si necesitamos filtrar por ubicación
    const hasCiudadId = !!(ciudad_id && ciudad_id !== '');
    const hasPaisId = !!(pais_id && pais_id !== '');
    const hasLocationText = !!(location && location !== '');
    const hasLocationFilter = hasCiudadId || hasPaisId || hasLocationText;

    // Configurar paginación
    const pageSize = Math.min(Number(size), 50); // Limitar el tamaño máximo de página
    const offset = Math.max(0, Number(page)) * pageSize;

    // Construir where clause para direccion/ciudad
    let direccionWhere: any = {};
    let ciudadWhere: any = {};

    if (hasCiudadId) {
      // Filtro por ciudad_id específico (dropdown)
      const ciudadIdNum = parseInt(ciudad_id as string, 10);
      if (!isNaN(ciudadIdNum)) {
        ciudadWhere.ciudad_id = ciudadIdNum;
      }
    } else if (hasPaisId) {
      // Filtro por pais_id - buscar todas las ciudades del país
      const paisIdNum = parseInt(pais_id as string, 10);
      if (!isNaN(paisIdNum)) {
        ciudadWhere.pais_id = paisIdNum;
      }
    }

    const events = await Event.findAll({
      where: whereClause,
      offset,
      limit: pageSize,
      subQuery: false,  // Añadir esta línea para evitar subconsultas
      include: [
        {
          model: Interes,
          as: 'intereses',
          required: !!(interests && interests !== ''),
          where: interests && interests !== '' ? {
            tipo: { [Op.in]: (interests as string).split(",").filter(i => i.trim() !== '') }
          } : undefined
        },
        {
          model: Direccion,
          required: hasLocationFilter,
          where: Object.keys(direccionWhere).length > 0 ? direccionWhere : undefined,
          include: [
            {
              model: Ciudad,
              required: hasLocationFilter,
              where: Object.keys(ciudadWhere).length > 0 ? ciudadWhere : undefined,
              include: [
                {
                  model: Pais,
                  required: false,
                  as: 'pais'
                }
              ]
            }
          ]
        },
        {
          model: InscripcionEvent,
          as: 'inscripciones',
          required: false
        },
        {
          model: User,
          as: 'usuario',
          required: false,
          attributes: {
            exclude: ['contrasena']
          }
        }
      ],
      order: [['fecha_inicio', 'ASC']]
    });

    // Si hay filtro de location por texto (no por id), filtrar en memoria por ciudad o país
    let filteredEvents = events;
    if (hasLocationText && !hasCiudadId && !hasPaisId) {
      const locationLower = (location as string).toLowerCase();
      filteredEvents = events.filter(event => {
        const ciudad = (event as any).direccion?.ciudad;
        const pais = ciudad?.pais;
        return (
          ciudad?.nombre?.toLowerCase().includes(locationLower) ||
          pais?.nombre?.toLowerCase().includes(locationLower)
        );
      });
    }

    // Si se proporciona usuario_id, agregar información de inscripción
    let eventsWithInscription = filteredEvents.map(event => {
      const eventData = event.toJSON() as any;
      
      // Verificar si el usuario está inscrito
      if (usuario_id) {
        const usuarioIdNum = parseInt(usuario_id as string, 10);
        eventData.usuario_inscrito = eventData.inscripciones?.some(
          (ins: any) => ins.usuario_id === usuarioIdNum
        ) || false;
        eventData.es_anfitrion = eventData.usuario_id === usuarioIdNum;
      } else {
        eventData.usuario_inscrito = false;
        eventData.es_anfitrion = false;
      }
      
      return eventData;
    });

    res.status(200).json({
      success: true,
      data: eventsWithInscription,
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
    const { usuario_id } = req.query;

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
          as: 'inscripciones',
          required: false,
          include: [
            {
              model: User,
              as: 'usuario',
              attributes: {
                exclude: ['contrasena']
              }
            }
          ]
        },
        {
          model: EventUser,
          required: false
        },
        {
          model: User,
          as: 'usuario',
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

    // Agregar información de inscripción del usuario
    const eventData = event.toJSON() as any;
    
    if (usuario_id) {
      const usuarioIdNum = parseInt(usuario_id as string, 10);
      eventData.usuario_inscrito = eventData.inscripciones?.some(
        (ins: any) => ins.usuario_id === usuarioIdNum
      ) || false;
      eventData.es_anfitrion = eventData.usuario_id === usuarioIdNum;
    } else {
      eventData.usuario_inscrito = false;
      eventData.es_anfitrion = false;
    }

    res.status(200).json({
      success: true,
      data: eventData
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
      ciudad_id,  // ID de la ciudad seleccionada del dropdown
      calle,
      numero,
      imagen_id,
      imagen_base64,
      imagen_mime_type,
      intereses // Array de strings con los tipos de interés, ej: ["Cultura", "Arte"]
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

    // Manejar la dirección del evento
    let finalDireccionId: number | null = null;

    if (direccion_id) {
      // Verificar que la dirección exista si se proporciona directamente
      const direccionExists = await Direccion.findByPk(direccion_id);
      if (!direccionExists) {
        res.status(404).json({
          success: false,
          message: "Address not found"
        });
        return;
      }
      finalDireccionId = Number(direccion_id);
    } else if (ciudad_id && calle) {
      // Crear una nueva dirección si se proporciona ciudad_id y calle
      const ciudadExists = await Ciudad.findByPk(ciudad_id);
      if (!ciudadExists) {
        res.status(404).json({
          success: false,
          message: "City not found"
        });
        return;
      }

      // Crear la nueva dirección
      const nuevaDireccion = await Direccion.create({
        ciudad_id: Number(ciudad_id),
        calle: calle,
        numero: numero || 'S/N'
      } as any);
      
      finalDireccionId = nuevaDireccion.direccion_id;
    }

    const newEvent = await Event.create({
      nombre_evento,
      descripcion_evento,
      fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
      horario,
      duracion,
      cant_participantes: cant_participantes ? Number(cant_participantes) : null,
      restriccion_edad: restriccion_edad ? Number(restriccion_edad) : null,
      direccion_id: finalDireccionId,
      usuario_id: Number(usuario_id),
      calle,
      numero,
      imagen_id: imagen_id ? Number(imagen_id) : null,
      imagen_base64: imagen_base64 || null,
      imagen_mime_type: imagen_mime_type || null
    } as any);

    // Crear los intereses asociados al evento si se proporcionan
    // Normalizar intereses: puede venir como array o como string separado por comas
    let interesesArray: string[] = [];
    if (intereses) {
      if (Array.isArray(intereses)) {
        interesesArray = intereses.filter((i: any) => i && typeof i === 'string' && i.trim() !== '');
      } else if (typeof intereses === 'string' && intereses.trim() !== '') {
        interesesArray = intereses.split(',').map((i: string) => i.trim()).filter((i: string) => i !== '');
      }
    }
    
    if (interesesArray.length > 0) {
      const interesesData = interesesArray.map((tipo: string) => ({
        evento_id: newEvent.evento_id,
        itinerario_id: null,
        tipo: tipo.trim()
      }));
      await Interes.bulkCreate(interesesData as any);
    }

    // Obtener el evento con sus intereses y dirección para devolverlo
    const eventWithIntereses = await Event.findByPk(newEvent.evento_id, {
      include: [
        { model: Interes, as: 'intereses' },
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
                  required: false,
                  as: 'pais'
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: eventWithIntereses
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

    // Obtener el usuario autenticado
    const authUser = req.user;
    let requestingUserId: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      requestingUserId = authenticatedUser?.usuario_id ?? null;
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
      ciudad_id,  // ID de la ciudad seleccionada del dropdown
      calle,
      numero,
      imagen_id,
      imagen_base64,
      imagen_mime_type,
      intereses // Array de strings con los tipos de interés
    } = req.body;

    // Verificar que el usuario que solicita es el creador del evento
    if (requestingUserId && event.usuario_id !== requestingUserId) {
      res.status(403).json({
        success: false,
        message: "Solo el creador del evento puede editarlo"
      });
      return;
    }

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

    // Manejar la dirección del evento
    let finalDireccionId: number | null | undefined = undefined;

    if (direccion_id !== undefined) {
      // Si se proporciona direccion_id directamente
      if (direccion_id) {
        const direccionExists = await Direccion.findByPk(direccion_id);
        if (!direccionExists) {
          res.status(404).json({
            success: false,
            message: "Address not found"
          });
          return;
        }
        finalDireccionId = Number(direccion_id);
      } else {
        finalDireccionId = null;
      }
    } else if (ciudad_id && calle) {
      // Crear una nueva dirección si se proporciona ciudad_id y calle
      const ciudadExists = await Ciudad.findByPk(ciudad_id);
      if (!ciudadExists) {
        res.status(404).json({
          success: false,
          message: "City not found"
        });
        return;
      }

      // Crear la nueva dirección
      const nuevaDireccion = await Direccion.create({
        ciudad_id: Number(ciudad_id),
        calle: calle,
        numero: numero || 'S/N'
      } as any);
      
      finalDireccionId = nuevaDireccion.direccion_id;
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
      direccion_id: finalDireccionId !== undefined ? finalDireccionId : event.direccion_id,
      usuario_id: usuario_id !== undefined ? Number(usuario_id) : event.usuario_id,
      calle: calle ?? event.calle,
      numero: numero ?? event.numero,
      imagen_id: imagen_id !== undefined ? Number(imagen_id) : event.imagen_id,
      imagen_base64: imagen_base64 !== undefined ? imagen_base64 : event.imagen_base64,
      imagen_mime_type: imagen_mime_type !== undefined ? imagen_mime_type : event.imagen_mime_type
    });

    // Actualizar intereses si se proporcionan
    if (intereses !== undefined && Array.isArray(intereses)) {
      // Eliminar intereses existentes del evento
      await Interes.destroy({ where: { evento_id: Number(id) } });
      
      // Crear nuevos intereses si hay alguno
      if (intereses.length > 0) {
        const interesesData = intereses.map((tipo: string) => ({
          evento_id: Number(id),
          itinerario_id: null,
          tipo: tipo.trim()
        }));
        await Interes.bulkCreate(interesesData as any);
      }
    }

    // Obtener el evento actualizado con sus intereses y dirección
    const updatedEvent = await Event.findByPk(Number(id), {
      include: [
        { model: Interes, as: 'intereses' },
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
                  required: false,
                  as: 'pais'
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
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
    
    // Obtener el usuario autenticado
    const authUser = req.user;
    let requestingUserId: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      requestingUserId = authenticatedUser?.usuario_id ?? null;
    }

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

    // Verificar que el usuario que solicita es el creador del evento
    if (requestingUserId && event.usuario_id !== requestingUserId) {
      res.status(403).json({
        success: false,
        message: "Solo el creador del evento puede eliminarlo"
      });
      return;
    }

    // Eliminar inscripciones relacionadas primero
    await InscripcionEvent.destroy({
      where: { evento_id: Number(id) }
    });

    // Eliminar mensajes relacionados
    await MensajeEvent.destroy({
      where: { evento_id: Number(id) }
    });

    // Eliminar registros de lectura del chat
    await ChatUsuarioLectura.destroy({
      where: { evento_id: Number(id) }
    });

    // Eliminar relaciones usuario-evento
    await EventUser.destroy({
      where: { evento_id: Number(id) }
    });

    // Eliminar intereses relacionados
    await Interes.destroy({
      where: { evento_id: Number(id) }
    });

    // Eliminar el evento
    await event.destroy();

    res.status(200).json({
      success: true,
      message: "Evento eliminado correctamente"
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

    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = authenticatedUser?.usuario_id ?? null;
    }

    // Validar que el id del evento sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Validar que el usuario esté autenticado
    if (!usuario_id) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
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

    // Verificar cupos disponibles
    if (event.cant_participantes) {
      const currentInscriptions = await InscripcionEvent.count({
        where: { evento_id: Number(id) }
      });
      
      if (currentInscriptions >= event.cant_participantes) {
        res.status(400).json({ 
          success: false, 
          message: "El evento está lleno. No hay cupos disponibles.",
          errorCode: "EVENT_FULL"
        });
        return;
      }
    }

    // Si el evento tiene restricción de edad, validar verificación y edad del usuario
    if (event.restriccion_edad && event.restriccion_edad > 0) {
      // Verificar que el usuario tenga verificación aprobada
      if (!user.verificacion) {
        res.status(403).json({ 
          success: false, 
          message: "Este evento requiere verificación de identidad. Por favor, verifica tu identidad primero.",
          errorCode: "VERIFICATION_REQUIRED"
        });
        return;
      }

      // Verificar que el usuario tenga fecha de nacimiento registrada
      if (!user.fecha_nacimiento) {
        res.status(403).json({ 
          success: false, 
          message: "No se encontró tu fecha de nacimiento. Por favor, verifica tu identidad.",
          errorCode: "VERIFICATION_REQUIRED"
        });
        return;
      }

      // Calcular la edad del usuario
      const today = new Date();
      const birthDate = new Date(user.fecha_nacimiento);
      let userAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        userAge--;
      }

      // Verificar que el usuario cumpla con la edad mínima
      if (userAge < event.restriccion_edad) {
        res.status(403).json({ 
          success: false, 
          message: `Debes tener al menos ${event.restriccion_edad} años para unirte a este evento. Tu edad actual es ${userAge} años.`,
          errorCode: "AGE_RESTRICTION"
        });
        return;
      }
    }

    // Verificar si el usuario ya está inscrito
    const existingInscription = await InscripcionEvent.findOne({
      where: { evento_id: Number(id), usuario_id: Number(usuario_id) }
    });

    if (existingInscription) {
      res.status(409).json({ success: false, message: "Ya estás inscrito en este evento" });
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
      message: "¡Te has unido al evento exitosamente!",
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
    const { id } = req.params;

    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = authenticatedUser?.usuario_id ?? null;
    }

    // Validar que el id del evento sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Validar que el usuario esté autenticado
    if (!usuario_id) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
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
      where: { evento_id: Number(id), usuario_id: usuario_id }
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

export const sendEventMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { mensaje } = req.body;

    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = authenticatedUser?.usuario_id ?? null;
    }

    // Validar que el id del evento sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Validar que mensaje esté presente
    if (!mensaje || mensaje.trim() === '') {
      res.status(400).json({ success: false, message: "mensaje is required" });
      return;
    }

    // Verificar que el evento exista
    const event = await Event.findByPk(Number(id));
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Verificar que el usuario exista si se proporciona
    if (usuario_id) {
      const user = await User.findByPk(Number(usuario_id));
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
    }

    // Crear el mensaje
    const newMessage = await MensajeEvent.create({
      evento_id: Number(id),
      usuario_id: usuario_id ? Number(usuario_id) : null,
      mensaje: mensaje.trim(),
      fecha_creacion: new Date()
    } as any);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });

  } catch (error) {
    console.error('Error sending event message:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error sending event message",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const getUserEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { usuario_id } = req.params;

    if (!usuario_id || isNaN(Number(usuario_id))) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    // Fecha de hoy para filtrar eventos pasados
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener eventos creados por el usuario (solo futuros o sin fecha)
    const createdEvents = await Event.findAll({
      where: { 
        usuario_id: Number(usuario_id),
        [Op.or]: [
          { fecha_inicio: { [Op.gte]: today } },
          { fecha_inicio: { [Op.is]: null } }
        ]
      },
      include: [
        {
          model: Direccion,
          attributes: ['calle', 'numero'],
          include: [{ model: Ciudad, attributes: ['nombre'] }]
        },
        {
          model: InscripcionEvent,
          attributes: ['inscripcion_evento_id']
        }
      ]
    });

    // Obtener eventos a los que el usuario se ha unido
    const joinedEvents = await InscripcionEvent.findAll({
      where: { usuario_id: Number(usuario_id) },
      include: [
        {
          model: Event,
          include: [
            {
              model: Direccion,
              attributes: ['calle', 'numero'],
              include: [{ model: Ciudad, attributes: ['nombre'] }]
            },
            {
              model: InscripcionEvent,
              attributes: ['inscripcion_evento_id']
            }
          ]
        }
      ]
    });

    // Formatear respuesta
    const events = [
      ...createdEvents.map(e => ({
        id: e.evento_id,
        title: e.nombre_evento,
        description: e.descripcion_evento,
        image: e.imagen_base64 
          ? `data:${e.imagen_mime_type || 'image/jpeg'};base64,${e.imagen_base64}`
          : (e.imagen_id ? `/api/images/${e.imagen_id}` : '/placeholder.svg'),
        date: e.fecha_inicio,
        time: e.horario,
        location: e.direccion?.calle ? `${e.direccion.calle}${e.direccion.numero ? ` ${e.direccion.numero}` : ''}` : e.calle || 'Sin ubicación',
        city: (e.direccion as any)?.ciudad?.nombre || '',
        participants: e.inscripciones?.length || 0,
        maxParticipants: e.cant_participantes,
        restriccion_edad: e.restriccion_edad,
        usuario_id: e.usuario_id,
        role: 'Anfitrión',
        isOwner: true
      })),
      ...joinedEvents
        .filter(i => {
          // Excluir eventos propios
          if (!i.evento || i.evento.usuario_id === Number(usuario_id)) return false;
          // Excluir eventos pasados
          if (i.evento.fecha_inicio) {
            const eventDate = new Date(i.evento.fecha_inicio);
            if (eventDate < today) return false;
          }
          return true;
        })
        .map(i => ({
          id: i.evento?.evento_id,
          title: i.evento?.nombre_evento,
          description: i.evento?.descripcion_evento,
          image: i.evento?.imagen_base64 
            ? `data:${i.evento?.imagen_mime_type || 'image/jpeg'};base64,${i.evento?.imagen_base64}`
            : (i.evento?.imagen_id ? `/api/images/${i.evento?.imagen_id}` : '/placeholder.svg'),
          date: i.evento?.fecha_inicio,
          time: i.evento?.horario,
          location: i.evento?.direccion?.calle ? `${i.evento.direccion.calle}${i.evento.direccion.numero ? ` ${i.evento.direccion.numero}` : ''}` : i.evento?.calle || 'Sin ubicación',
          city: (i.evento?.direccion as any)?.ciudad?.nombre || '',
          participants: i.evento?.inscripciones?.length || 0,
          maxParticipants: i.evento?.cant_participantes,
          restriccion_edad: i.evento?.restriccion_edad,
          usuario_id: i.evento?.usuario_id,
          role: 'Participante',
          isOwner: false
        }))
    ];

    res.status(200).json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Error fetching user events:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching user events",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
