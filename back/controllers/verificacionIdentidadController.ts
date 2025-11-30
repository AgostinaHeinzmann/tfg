import { Request, Response } from "express";
import { User } from "../models/User";
import VerificacionIdentidad from "../models/VerificacionIdentidad";

// POST: Iniciar verificación por escaneo de DNI
export const iniciarVerificacionEscaneo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ success: false, message: "Request body is required" });
      return;
    }

    const { usuario_id, imagen_base64, edad_extraida, numero_documento } = req.body;

    // Validar campos requeridos
    if (!usuario_id || !imagen_base64) {
      res.status(400).json({ 
        success: false, 
        message: "usuario_id and imagen_base64 are required" 
      });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Verificar si ya tiene una verificación pendiente o aprobada
    const verificacionExistente = await VerificacionIdentidad.findOne({
      where: { 
        usuario_id,
        estado: ["pendiente", "aprobado"]
      }
    });

    if (verificacionExistente) {
      res.status(409).json({ 
        success: false, 
        message: "User already has a pending or approved verification" 
      });
      return;
    }

    // Crear registro de verificación
    const verificacion = await VerificacionIdentidad.create({
      usuario_id,
      imagen_dni: imagen_base64,
      tipo_verificacion: "escaneado",
      estado: "pendiente",
      edad_extraida: edad_extraida || null,
      numero_documento: numero_documento || null,
      fecha_creacion: new Date()
    } as any);

    res.status(201).json({
      success: true,
      message: "Identity verification initiated (scan)",
      data: {
        verificacion_id: verificacion.verificacion_id,
        estado: verificacion.estado,
        fecha_creacion: verificacion.fecha_creacion
      }
    });

  } catch (error) {
    console.error('Error initiating scan verification:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error initiating verification",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// POST: Iniciar verificación por subida de imagen
export const iniciarVerificacionImagen = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ success: false, message: "Request body is required" });
      return;
    }

    const { usuario_id, imagen_base64 } = req.body;

    // Validar campos requeridos
    if (!usuario_id || !imagen_base64) {
      res.status(400).json({ 
        success: false, 
        message: "usuario_id and imagen_base64 are required" 
      });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Verificar si ya tiene una verificación pendiente o aprobada
    const verificacionExistente = await VerificacionIdentidad.findOne({
      where: { 
        usuario_id,
        estado: ["pendiente", "aprobado"]
      }
    });

    if (verificacionExistente) {
      res.status(409).json({ 
        success: false, 
        message: "User already has a pending or approved verification" 
      });
      return;
    }

    // Crear registro de verificación
    const verificacion = await VerificacionIdentidad.create({
      usuario_id,
      imagen_dni: imagen_base64,
      tipo_verificacion: "subida",
      estado: "pendiente",
      fecha_creacion: new Date()
    } as any);

    res.status(201).json({
      success: true,
      message: "Identity verification initiated (upload)",
      data: {
        verificacion_id: verificacion.verificacion_id,
        estado: verificacion.estado,
        fecha_creacion: verificacion.fecha_creacion
      }
    });

  } catch (error) {
    console.error('Error initiating upload verification:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error initiating verification",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// GET: Obtener estado de verificación del usuario
export const obtenerEstadoVerificacion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { usuario_id } = req.params;

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

    // Obtener la verificación más reciente
    const verificacion = await VerificacionIdentidad.findOne({
      where: { usuario_id: Number(usuario_id) },
      order: [['fecha_creacion', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        usuario_id: user.usuario_id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        verificado: user.verificacion,
        edad_dni: user.edad_dni,
        verificacion: verificacion ? {
          verificacion_id: verificacion.verificacion_id,
          estado: verificacion.estado,
          tipo_verificacion: verificacion.tipo_verificacion,
          fecha_creacion: verificacion.fecha_creacion,
          fecha_verificacion: verificacion.fecha_verificacion,
          razon_rechazo: verificacion.razon_rechazo
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching verification status:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching verification status",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// PUT: Aprobar verificación (Admin endpoint)
export const aprobarVerificacion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { verificacion_id } = req.params;

    if (!verificacion_id || isNaN(Number(verificacion_id))) {
      res.status(400).json({ success: false, message: "Invalid verification ID" });
      return;
    }

    const verificacion = await VerificacionIdentidad.findByPk(Number(verificacion_id));
    if (!verificacion) {
      res.status(404).json({ success: false, message: "Verification not found" });
      return;
    }

    // Actualizar estado de verificación
    await verificacion.update({
      estado: "aprobado",
      fecha_verificacion: new Date()
    });

    // Actualizar usuario para marcar como verificado
    const user = await User.findByPk(verificacion.usuario_id);
    if (user) {
      await user.update({
        verificacion: true,
        edad_dni: verificacion.edad_extraida || user.edad_dni
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification approved",
      data: {
        verificacion_id: verificacion.verificacion_id,
        estado: "aprobado",
        fecha_verificacion: verificacion.fecha_verificacion
      }
    });

  } catch (error) {
    console.error('Error approving verification:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error approving verification",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// PUT: Rechazar verificación (Admin endpoint)
export const rechazarVerificacion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ success: false, message: "Request body is required" });
      return;
    }

    const { verificacion_id } = req.params;
    const { razon_rechazo } = req.body;

    if (!verificacion_id || isNaN(Number(verificacion_id))) {
      res.status(400).json({ success: false, message: "Invalid verification ID" });
      return;
    }

    if (!razon_rechazo) {
      res.status(400).json({ success: false, message: "razon_rechazo is required" });
      return;
    }

    const verificacion = await VerificacionIdentidad.findByPk(Number(verificacion_id));
    if (!verificacion) {
      res.status(404).json({ success: false, message: "Verification not found" });
      return;
    }

    // Actualizar estado de verificación
    await verificacion.update({
      estado: "rechazado",
      razon_rechazo,
      fecha_verificacion: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Verification rejected",
      data: {
        verificacion_id: verificacion.verificacion_id,
        estado: "rechazado",
        razon_rechazo
      }
    });

  } catch (error) {
    console.error('Error rejecting verification:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error rejecting verification",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// GET: Listar todas las verificaciones pendientes (Admin endpoint)
export const listarVerificacionesPendientes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, size = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(50, Math.max(1, Number(size)));
    const offset = (pageNum - 1) * pageSize;

    const { count, rows } = await VerificacionIdentidad.findAndCountAll({
      where: { estado: "pendiente" },
      include: [
        {
          model: User,
          attributes: {
            exclude: ['contrasena']
          }
        }
      ],
      order: [['fecha_creacion', 'ASC']],
      limit: pageSize,
      offset: offset
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        size: pageSize,
        pages: Math.ceil(count / pageSize)
      }
    });

  } catch (error) {
    console.error('Error listing pending verifications:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error listing verifications",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Middleware: Verificar que usuario esté verificado
export const verificarIdentidadMiddleware = async (
  req: Request,
  res: Response,
  next: Function
): Promise<void> => {
  try {
    const { usuario_id } = req.body;

    if (!usuario_id) {
      res.status(400).json({ success: false, message: "usuario_id is required in body" });
      return;
    }

    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.verificacion) {
      res.status(403).json({ 
        success: false, 
        message: "User identity not verified. Please verify your identity to access this feature." 
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in verification middleware:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error verifying identity",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
