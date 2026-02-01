import { Request, Response } from "express";
import { Op } from "sequelize";
import Publicacion from "../models/Publicacion";
import Comentario from "../models/Comentario";
import { User } from "../models/User";
import Ciudad from "../models/Ciudad";
import PublicacionImagen from "../models/PublicacionImagen";
import PublicacionLike from "../models/PublicacionLike";

// GET: Obtener feed con filtros (búsqueda por ciudad)
export const getFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ciudad_id, page = 1, size = 10, usuario_id } = req.query;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(50, Math.max(1, Number(size)));
    const offset = (pageNum - 1) * pageSize;

    let whereClause: any = {};

    // Filtrar por ciudad
    if (ciudad_id && ciudad_id !== '') {
      whereClause.ciudad_id = Number(ciudad_id);
    }

    const { count, rows } = await Publicacion.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: {
            exclude: ['contrasena']
          }
        },
        {
          model: Ciudad,
          attributes: ['ciudad_id', 'nombre']
        },
        {
          model: Comentario,
          include: [
            {
              model: User,
              attributes: {
                exclude: ['contrasena']
              }
            }
          ]
        },
        {
          model: PublicacionImagen,
          attributes: ['publicacion_imagen_id', 'imagen_id', 'imagen_base64', 'mime_type']
        }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit: pageSize,
      offset: offset
    });

    // Si hay usuario_id, verificar qué publicaciones tienen like del usuario
    let dataWithLikes: any[] = rows.map(row => row.toJSON());
    
    if (usuario_id) {
      const userLikes = await PublicacionLike.findAll({
        where: {
          usuario_id: Number(usuario_id),
          publicacion_id: rows.map(r => r.publicacion_id)
        },
        attributes: ['publicacion_id']
      });
      
      const likedPublicacionIds = new Set(userLikes.map(like => like.publicacion_id));
      
      dataWithLikes = dataWithLikes.map((pub: any) => ({
        ...pub,
        liked: likedPublicacionIds.has(pub.publicacion_id)
      }));
    }

    res.status(200).json({
      success: true,
      data: dataWithLikes,
      pagination: {
        total: count,
        page: pageNum,
        size: pageSize,
        pages: Math.ceil(count / pageSize)
      }
    });

  } catch (error) {
    console.error('Error fetching feed:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching feed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// GET: Obtener publicación por ID
export const getFeedById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid publication ID" });
      return;
    }

    const publicacion = await Publicacion.findByPk(Number(id), {
      include: [
        {
          model: User,
          attributes: {
            exclude: ['contrasena']
          }
        },
        {
          model: Ciudad,
          attributes: ['ciudad_id', 'nombre']
        },
        {
          model: Comentario,
          include: [
            {
              model: User,
              attributes: {
                exclude: ['contrasena']
              }
            }
          ],
          order: [['fecha_creacion', 'DESC']]
        },
        {
          model: PublicacionImagen,
          attributes: ['publicacion_imagen_id', 'imagen_id', 'imagen_base64', 'mime_type']
        }
      ]
    });

    if (!publicacion) {
      res.status(404).json({ success: false, message: "Publication not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: publicacion
    });

  } catch (error) {
    console.error('Error fetching publication:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching publication",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// POST: Crear publicación
export const createFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ success: false, message: "Request body is required" });
      return;
    }

    const { usuario_id, descripcion, ciudad_id, imagenes } = req.body;

    // Validar campos requeridos
    if (!usuario_id || !descripcion) {
      res.status(400).json({ success: false, message: "usuario_id and descripcion are required" });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Verificar que la ciudad exista si se proporciona
    if (ciudad_id) {
      const city = await Ciudad.findByPk(ciudad_id);
      if (!city) {
        res.status(404).json({ success: false, message: "City not found" });
        return;
      }
    }

    // Crear la publicación
    const publicacion = await Publicacion.create({
      usuario_id,
      descripcion,
      ciudad_id: ciudad_id || null,
      me_gusta: 0,
      fecha_creacion: new Date()
    } as any);

    // Agregar imágenes si se proporcionan (nuevo formato con base64)
    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      const imagenesData = imagenes.map((img: { base64: string; mimeType?: string } | number) => {
        // Soportar tanto el formato antiguo (imagen_id) como el nuevo (base64)
        if (typeof img === 'number') {
          return {
            publicacion_id: publicacion.publicacion_id,
            imagen_id: img
          };
        } else {
          return {
            publicacion_id: publicacion.publicacion_id,
            imagen_base64: img.base64,
            mime_type: img.mimeType || 'image/jpeg'
          };
        }
      });
      await PublicacionImagen.bulkCreate(imagenesData as any);
    }

    // Obtener la publicación completa
    const publicacionCompleta = await Publicacion.findByPk(publicacion.publicacion_id, {
      include: [
        {
          model: User,
          attributes: {
            exclude: ['contrasena']
          }
        },
        {
          model: Ciudad,
          attributes: ['ciudad_id', 'nombre']
        },
        {
          model: PublicacionImagen,
          attributes: ['publicacion_imagen_id', 'imagen_id', 'imagen_base64', 'mime_type']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Publication created successfully",
      data: publicacionCompleta
    });

  } catch (error) {
    console.error('Error creating publication:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error creating publication",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// PUT: Actualizar publicación (solo el propietario)
export const updateFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuario_id, descripcion, ciudad_id } = req.body;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid publication ID" });
      return;
    }

    const publicacion = await Publicacion.findByPk(Number(id));
    if (!publicacion) {
      res.status(404).json({ success: false, message: "Publication not found" });
      return;
    }

    // Verificar que el usuario sea el propietario
    if (publicacion.usuario_id !== usuario_id) {
      res.status(403).json({ success: false, message: "Unauthorized: You can only edit your own publications" });
      return;
    }

    // Verificar que la ciudad exista si se proporciona
    if (ciudad_id) {
      const city = await Ciudad.findByPk(ciudad_id);
      if (!city) {
        res.status(404).json({ success: false, message: "City not found" });
        return;
      }
    }

    // Actualizar solo los campos proporcionados
    await publicacion.update({
      descripcion: descripcion ?? publicacion.descripcion,
      ciudad_id: ciudad_id ?? publicacion.ciudad_id
    });

    res.status(200).json({
      success: true,
      message: "Publication updated successfully",
      data: publicacion
    });

  } catch (error) {
    console.error('Error updating publication:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error updating publication",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// DELETE: Eliminar publicación (solo el propietario)
export const deleteFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario_id = req.query.usuario_id || req.body?.usuario_id;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid publication ID" });
      return;
    }

    if (!usuario_id) {
      res.status(400).json({ success: false, message: "usuario_id is required" });
      return;
    }

    const publicacion = await Publicacion.findByPk(Number(id));
    if (!publicacion) {
      res.status(404).json({ success: false, message: "Publication not found" });
      return;
    }

    // Verificar que el usuario sea el propietario
    if (publicacion.usuario_id !== Number(usuario_id)) {
      res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own publications" });
      return;
    }

    // Eliminar comentarios asociados
    await Comentario.destroy({
      where: { publicacion_id: Number(id) }
    });

    // Eliminar imágenes asociadas
    await PublicacionImagen.destroy({
      where: { publicacion_id: Number(id) }
    });

    // Eliminar la publicación
    await publicacion.destroy();

    res.status(200).json({
      success: true,
      message: "Publication deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting publication:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error deleting publication",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// POST: Toggle me gusta a publicación
export const likePublication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body; // Necesitamos el usuario_id para saber quién da like

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid publication ID" });
      return;
    }

    if (!usuario_id) {
      res.status(400).json({ success: false, message: "usuario_id is required" });
      return;
    }

    const publicacion = await Publicacion.findByPk(Number(id));
    if (!publicacion) {
      res.status(404).json({ success: false, message: "Publication not found" });
      return;
    }

    // Verificar si ya existe el like
    const existingLike = await PublicacionLike.findOne({
      where: {
        publicacion_id: Number(id),
        usuario_id: Number(usuario_id)
      }
    });

    let liked = false;

    if (existingLike) {
      // Si existe, lo quitamos (dislike)
      await existingLike.destroy();
      publicacion.me_gusta = Math.max(0, (publicacion.me_gusta || 0) - 1);
      liked = false;
    } else {
      // Si no existe, lo creamos (like)
      await PublicacionLike.create({
        publicacion_id: Number(id),
        usuario_id: Number(usuario_id)
      } as any);
      publicacion.me_gusta = (publicacion.me_gusta || 0) + 1;
      liked = true;
    }

    await publicacion.save();

    res.status(200).json({
      success: true,
      message: liked ? "Like added successfully" : "Like removed successfully",
      data: {
        ...publicacion.toJSON(),
        liked // Devolvemos el estado actual para el usuario
      }
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error toggling like",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// POST: Comentar en publicación
export const commentPublication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.body) {
      res.status(400).json({ success: false, message: "Request body is required" });
      return;
    }

    const { usuario_id, mensaje } = req.body;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Invalid publication ID" });
      return;
    }

    if (!usuario_id || !mensaje) {
      res.status(400).json({ success: false, message: "usuario_id and mensaje are required" });
      return;
    }

    // Verificar que la publicación exista
    const publicacion = await Publicacion.findByPk(Number(id));
    if (!publicacion) {
      res.status(404).json({ success: false, message: "Publication not found" });
      return;
    }

    // Verificar que el usuario exista
    const user = await User.findByPk(usuario_id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Crear comentario
    const comentario = await Comentario.create({
      usuario_id,
      publicacion_id: Number(id),
      mensaje,
      fecha_creacion: new Date()
    } as any);

    // Obtener comentario con datos del usuario
    const comentarioCompleto = await Comentario.findByPk(comentario.comentario_id, {
      include: [
        {
          model: User,
          attributes: {
            exclude: ['contrasena']
          }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comentarioCompleto
    });

  } catch (error) {
    console.error('Error commenting publication:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error commenting publication",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// DELETE: Eliminar comentario (solo el propietario del comentario)
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comentario_id } = req.params;
    const { usuario_id } = req.body;

    if (!comentario_id || isNaN(Number(comentario_id))) {
      res.status(400).json({ success: false, message: "Invalid comment ID" });
      return;
    }

    const comentario = await Comentario.findByPk(Number(comentario_id));
    if (!comentario) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    // Verificar que el usuario sea el propietario del comentario
    if (comentario.usuario_id !== usuario_id) {
      res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own comments" });
      return;
    }

    await comentario.destroy();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error deleting comment",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

