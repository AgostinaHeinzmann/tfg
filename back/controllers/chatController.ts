import { Request, Response } from "express";
import { Event } from "../models/Event";
import { User } from "../models/User";
import MensajeEvent from "../models/MensajeEvent";
import InscripcionEvent from "../models/InscripcionEvent";
import ChatUsuarioLectura from "../models/ChatUsuarioLectura";
import Direccion from "../models/Direccion";
import { Ciudad } from "../models/Ciudad";
import { Op, literal, fn, col } from "sequelize";

/**
 * Obtiene todos los chats del usuario (eventos donde es creador o está inscrito)
 * con contador de mensajes no leídos
 */
export const getUserChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = authenticatedUser?.usuario_id ?? null;
    }

    if (!usuario_id) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    // Fecha de hoy para filtrar eventos pasados
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener eventos creados por el usuario (solo futuros o sin fecha)
    const createdEvents = await Event.findAll({
      where: { 
        usuario_id: usuario_id,
        [Op.or]: [
          { fecha_inicio: { [Op.gte]: today } },
          { fecha_inicio: { [Op.is]: null } }
        ]
      },
      include: [
        {
          model: Direccion,
          required: false,
          include: [{ model: Ciudad, required: false }]
        },
        {
          model: User,
          required: false,
          attributes: ['usuario_id', 'nombre', 'apellido', 'imagen_perfil_id']
        },
        {
          model: InscripcionEvent,
          required: false
        }
      ]
    });

    // Obtener eventos a los que el usuario está inscrito
    const joinedInscriptions = await InscripcionEvent.findAll({
      where: { usuario_id: usuario_id },
      include: [
        {
          model: Event,
          required: true,
          where: {
            [Op.or]: [
              { fecha_inicio: { [Op.gte]: today } },
              { fecha_inicio: { [Op.is]: null } }
            ]
          },
          include: [
            {
              model: Direccion,
              required: false,
              include: [{ model: Ciudad, required: false }]
            },
            {
              model: User,
              required: false,
              attributes: ['usuario_id', 'nombre', 'apellido', 'imagen_perfil_id']
            },
            {
              model: InscripcionEvent,
              required: false
            }
          ]
        }
      ]
    });

    // Combinar eventos (evitar duplicados si el creador también está inscrito)
    const allEventIds = new Set<number>();
    const allEvents: Event[] = [];

    for (const event of createdEvents) {
      if (!allEventIds.has(event.evento_id)) {
        allEventIds.add(event.evento_id);
        allEvents.push(event);
      }
    }

    for (const inscription of joinedInscriptions) {
      if (inscription.evento && !allEventIds.has(inscription.evento.evento_id)) {
        allEventIds.add(inscription.evento.evento_id);
        allEvents.push(inscription.evento);
      }
    }

    // Obtener última lectura del usuario para cada evento
    const lecturas = await ChatUsuarioLectura.findAll({
      where: {
        usuario_id: usuario_id,
        evento_id: { [Op.in]: Array.from(allEventIds) }
      }
    });

    const lecturasMap = new Map<number, Date>();
    for (const lectura of lecturas) {
      lecturasMap.set(lectura.evento_id, lectura.ultima_lectura);
    }

    // Contar mensajes no leídos y obtener último mensaje para cada evento
    const chatsWithUnread = await Promise.all(
      allEvents.map(async (event) => {
        const ultimaLectura = lecturasMap.get(event.evento_id);
        
        // Contar mensajes no leídos (después de última lectura)
        let unreadCount = 0;
        if (ultimaLectura) {
          unreadCount = await MensajeEvent.count({
            where: {
              evento_id: event.evento_id,
              fecha_creacion: { [Op.gt]: ultimaLectura },
              // No contar mensajes propios
              [Op.or]: [
                { usuario_id: { [Op.ne]: usuario_id } },
                { usuario_id: { [Op.is]: null } }
              ]
            }
          });
        } else {
          // Si nunca leyó, todos los mensajes están sin leer (excepto los propios)
          unreadCount = await MensajeEvent.count({
            where: {
              evento_id: event.evento_id,
              [Op.or]: [
                { usuario_id: { [Op.ne]: usuario_id } },
                { usuario_id: { [Op.is]: null } }
              ]
            }
          });
        }

        // Obtener último mensaje
        const lastMessage = await MensajeEvent.findOne({
          where: { evento_id: event.evento_id },
          order: [['fecha_creacion', 'DESC']],
          include: [{
            model: User,
            required: false,
            attributes: ['usuario_id', 'nombre', 'apellido']
          }]
        });

        const isOwner = event.usuario_id === usuario_id;
        const participantsCount = event.inscripciones?.length || 0;

        return {
          evento_id: event.evento_id,
          nombre_evento: event.nombre_evento,
          descripcion_evento: event.descripcion_evento,
          imagen: event.imagen_base64 
            ? `data:${event.imagen_mime_type || 'image/jpeg'};base64,${event.imagen_base64}`
            : (event.imagen_id ? `/api/images/${event.imagen_id}` : null),
          fecha_inicio: event.fecha_inicio,
          horario: event.horario,
          duracion: event.duracion,
          ubicacion: event.direccion?.calle 
            ? `${event.direccion.calle}${event.direccion.numero ? ` ${event.direccion.numero}` : ''}`
            : event.calle || null,
          ciudad: (event.direccion as any)?.ciudad?.nombre || null,
          cant_participantes: event.cant_participantes,
          participantes_actuales: participantsCount,
          creador: event.usuario ? {
            usuario_id: event.usuario.usuario_id,
            nombre: event.usuario.nombre,
            apellido: event.usuario.apellido,
            imagen_perfil_id: event.usuario.imagen_perfil_id
          } : null,
          // Nombres en snake_case para compatibilidad con frontend
          es_creador: isOwner,
          role: isOwner ? 'Anfitrión' : 'Participante',
          unread_count: unreadCount,
          ultimo_mensaje: lastMessage?.mensaje || null,
          ultimo_mensaje_fecha: lastMessage?.fecha_creacion || null
        };
      })
    );

    // Ordenar por último mensaje (más reciente primero)
    chatsWithUnread.sort((a, b) => {
      const dateA = a.ultimo_mensaje_fecha ? new Date(a.ultimo_mensaje_fecha).getTime() : 0;
      const dateB = b.ultimo_mensaje_fecha ? new Date(b.ultimo_mensaje_fecha).getTime() : 0;
      return dateB - dateA;
    });

    // Calcular total de mensajes no leídos
    const totalUnread = chatsWithUnread.reduce((sum, chat) => sum + chat.unread_count, 0);

    res.status(200).json({
      success: true,
      data: {
        chats: chatsWithUnread,
        totalUnread
      }
    });

  } catch (error) {
    console.error('Error fetching user chats:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching user chats",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

/**
 * Obtiene los mensajes de un evento con información del usuario
 */
export const getChatMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = '50', before } = req.query;

    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = authenticatedUser?.usuario_id ?? null;
    }

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid event ID" });
      return;
    }

    // Verificar que el evento exista
    const event = await Event.findByPk(Number(id), {
      include: [
        {
          model: Direccion,
          required: false,
          include: [{ model: Ciudad, required: false }]
        },
        {
          model: User,
          required: false,
          attributes: ['usuario_id', 'nombre', 'apellido', 'imagen_perfil_id']
        },
        {
          model: InscripcionEvent,
          required: false,
          include: [{
            model: User,
            required: false,
            attributes: ['usuario_id', 'nombre', 'apellido', 'imagen_perfil_id']
          }]
        }
      ]
    });

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Verificar que el usuario tenga acceso al chat (es creador o está inscrito)
    if (usuario_id) {
      const isOwner = event.usuario_id === usuario_id;
      const isParticipant = event.inscripciones?.some(i => i.usuario_id === usuario_id);
      
      if (!isOwner && !isParticipant) {
        res.status(403).json({ 
          success: false, 
          message: "No tienes acceso a este chat. Debes ser participante o creador del evento." 
        });
        return;
      }
    }

    // Construir where clause para mensajes
    let whereClause: any = { evento_id: Number(id) };
    
    // Si se especifica "before", obtener mensajes anteriores a ese ID (para paginación)
    if (before && !isNaN(Number(before))) {
      whereClause.mensaje_evento_id = { [Op.lt]: Number(before) };
    }

    // Obtener mensajes con información del usuario
    const messages = await MensajeEvent.findAll({
      where: whereClause,
      order: [['fecha_creacion', 'DESC']],
      limit: Math.min(Number(limit), 100),
      include: [{
        model: User,
        required: false,
        attributes: ['usuario_id', 'nombre', 'apellido', 'imagen_perfil_id']
      }]
    });

    // Invertir para mostrar en orden cronológico
    messages.reverse();

    // Formatear mensajes - usar nombres compatibles con frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.mensaje_evento_id,
      usuario_id: msg.usuario_id,
      mensaje: msg.mensaje,
      fecha_creacion: msg.fecha_creacion,
      isOwnMessage: usuario_id ? msg.usuario_id === usuario_id : false,
      usuario: msg.usuario ? {
        id: msg.usuario.usuario_id,
        nombre: msg.usuario.nombre,
        apellido: msg.usuario.apellido,
        imagen_perfil: msg.usuario.imagen_perfil_id || null
      } : null
    }));

    // Obtener lista de participantes
    const participants = [
      // Creador del evento
      ...(event.usuario ? [{
        id: event.usuario.usuario_id,
        nombre: event.usuario.nombre,
        apellido: event.usuario.apellido,
        imagen_perfil: event.usuario.imagen_perfil_id || null,
        role: 'Anfitrión' as const
      }] : []),
      // Participantes inscritos
      ...(event.inscripciones?.map(i => ({
        id: i.usuario?.usuario_id,
        nombre: i.usuario?.nombre,
        apellido: i.usuario?.apellido,
        imagen_perfil: i.usuario?.imagen_perfil_id || null,
        role: 'Participante' as const
      })).filter(p => p.id && p.id !== event.usuario_id) || [])
    ];

    // Información del evento para el detalle
    const eventInfo = {
      evento_id: event.evento_id,
      nombre_evento: event.nombre_evento,
      descripcion_evento: event.descripcion_evento,
      imagen: event.imagen_base64 
        ? `data:${event.imagen_mime_type || 'image/jpeg'};base64,${event.imagen_base64}`
        : (event.imagen_id ? `/api/images/${event.imagen_id}` : null),
      fecha_inicio: event.fecha_inicio,
      horario: event.horario,
      duracion: event.duracion,
      ubicacion: event.direccion?.calle 
        ? `${event.direccion.calle}${event.direccion.numero ? ` ${event.direccion.numero}` : ''}`
        : event.calle || null,
      ciudad: (event.direccion as any)?.ciudad?.nombre || null,
      cant_participantes: event.cant_participantes,
      participantes_actuales: event.inscripciones?.length || 0, // Solo inscripciones, sin contar al creador
      creador_id: event.usuario_id, // ID del creador para verificar badge de anfitrión
      creador: event.usuario ? {
        id: event.usuario.usuario_id,
        nombre: event.usuario.nombre,
        apellido: event.usuario.apellido,
        imagen_perfil: event.usuario.imagen_perfil_id || null
      } : null
    };

    res.status(200).json({
      success: true,
      data: {
        event: eventInfo,
        messages: formattedMessages,
        participants,
        hasMore: messages.length === Number(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching chat messages",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

/**
 * Envía un mensaje al chat de un evento
 */
export const sendChatMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { mensaje } = req.body;

    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    let user: User | null = null;
    
    if (authUser?.uid) {
      user = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = user?.usuario_id ?? null;
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

    // Validar que el usuario esté autenticado
    if (!usuario_id) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    // Verificar que el evento exista
    const event = await Event.findByPk(Number(id), {
      include: [{ model: InscripcionEvent, required: false }]
    });

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Verificar que el usuario tenga acceso al chat
    const isOwner = event.usuario_id === usuario_id;
    const isParticipant = event.inscripciones?.some(i => i.usuario_id === usuario_id);
    
    if (!isOwner && !isParticipant) {
      res.status(403).json({ 
        success: false, 
        message: "No tienes permiso para enviar mensajes en este chat." 
      });
      return;
    }

    // Crear el mensaje
    const newMessage = await MensajeEvent.create({
      evento_id: Number(id),
      usuario_id: usuario_id,
      mensaje: mensaje.trim(),
      fecha_creacion: new Date()
    } as any);

    // Actualizar última lectura del usuario que envía
    await ChatUsuarioLectura.upsert({
      evento_id: Number(id),
      usuario_id: usuario_id,
      ultima_lectura: new Date()
    } as any);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        mensaje_evento_id: newMessage.mensaje_evento_id,
        mensaje: newMessage.mensaje,
        fecha_creacion: newMessage.fecha_creacion,
        isOwnMessage: true,
        usuario: user ? {
          usuario_id: user.usuario_id,
          nombre: user.nombre,
          apellido: user.apellido,
          imagen_perfil_id: user.imagen_perfil_id,
          isOwner
        } : null
      }
    });

  } catch (error) {
    console.error('Error sending chat message:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error sending chat message",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

/**
 * Marca el chat de un evento como leído para el usuario actual
 */
export const markChatAsRead = async (
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

    // Actualizar o crear registro de última lectura
    await ChatUsuarioLectura.upsert({
      evento_id: Number(id),
      usuario_id: usuario_id,
      ultima_lectura: new Date()
    } as any);

    res.status(200).json({
      success: true,
      message: "Chat marked as read"
    });

  } catch (error) {
    console.error('Error marking chat as read:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error marking chat as read",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

/**
 * Obtiene el conteo total de mensajes no leídos del usuario
 */
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Obtener el usuario autenticado
    const authUser = req.user;
    let usuario_id: number | null = null;
    
    if (authUser?.uid) {
      const authenticatedUser = await User.findOne({ where: { uid: authUser.uid } });
      usuario_id = authenticatedUser?.usuario_id ?? null;
    }

    if (!usuario_id) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    // Fecha de hoy para filtrar eventos pasados
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener IDs de eventos del usuario (creador o inscrito)
    const createdEventIds = await Event.findAll({
      where: { 
        usuario_id: usuario_id,
        [Op.or]: [
          { fecha_inicio: { [Op.gte]: today } },
          { fecha_inicio: { [Op.is]: null } }
        ]
      },
      attributes: ['evento_id']
    });

    const joinedEventIds = await InscripcionEvent.findAll({
      where: { usuario_id: usuario_id },
      include: [{
        model: Event,
        required: true,
        where: {
          [Op.or]: [
            { fecha_inicio: { [Op.gte]: today } },
            { fecha_inicio: { [Op.is]: null } }
          ]
        },
        attributes: ['evento_id']
      }]
    });

    const allEventIds = new Set<number>();
    createdEventIds.forEach(e => allEventIds.add(e.evento_id));
    joinedEventIds.forEach(i => {
      if (i.evento) allEventIds.add(i.evento.evento_id);
    });

    if (allEventIds.size === 0) {
      res.status(200).json({ success: true, data: { totalUnread: 0 } });
      return;
    }

    // Obtener últimas lecturas
    const lecturas = await ChatUsuarioLectura.findAll({
      where: {
        usuario_id: usuario_id,
        evento_id: { [Op.in]: Array.from(allEventIds) }
      }
    });

    const lecturasMap = new Map<number, Date>();
    for (const lectura of lecturas) {
      lecturasMap.set(lectura.evento_id, lectura.ultima_lectura);
    }

    // Contar mensajes no leídos
    let totalUnread = 0;
    for (const eventoId of allEventIds) {
      const ultimaLectura = lecturasMap.get(eventoId);
      
      let unreadCount = 0;
      if (ultimaLectura) {
        unreadCount = await MensajeEvent.count({
          where: {
            evento_id: eventoId,
            fecha_creacion: { [Op.gt]: ultimaLectura },
            [Op.or]: [
              { usuario_id: { [Op.ne]: usuario_id } },
              { usuario_id: { [Op.is]: null } }
            ]
          }
        });
      } else {
        unreadCount = await MensajeEvent.count({
          where: {
            evento_id: eventoId,
            [Op.or]: [
              { usuario_id: { [Op.ne]: usuario_id } },
              { usuario_id: { [Op.is]: null } }
            ]
          }
        });
      }
      
      totalUnread += unreadCount;
    }

    res.status(200).json({
      success: true,
      data: { totalUnread }
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error getting unread count",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
