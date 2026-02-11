import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User } from "../models/User";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, contrasena, uid, imagen_perfil_id } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: "El email ya está registrado" });
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario en la base de datos
    const newUser = await User.create({
      nombre,
      apellido,
      email,
      contrasena: hashedPassword,
      verificacion: false,
      uid: uid || null,
      imagen_perfil_id: imagen_perfil_id || null,
    });

    res.status(201).json({
      success: true,
      user: newUser
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en el registro", error });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, contrasena } = req.body;

    // Buscar usuario en DB
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: "Credenciales inválidas" });
      return;
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Credenciales inválidas" });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en el login", error });
    return;
  }
};

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, uid, nombre, apellido, imagen_perfil } = req.body;

    if (!email || !uid) {
      res.status(400).json({ success: false, message: "Email and UID are required" });
      return;
    }

    // Buscar usuario por UID o Email
    let user = await User.findOne({
      where: {
        [Op.or]: [{ uid }, { email }]
      }
    });

    if (user) {
      // Siempre actualizar el UID
      user.uid = uid;
      
      // Solo actualizar nombre/apellido si el usuario no tiene uno guardado
      // o si el valor entrante es significativo (no es 'Usuario' ni está vacío)
      if (nombre && nombre !== 'Usuario' && !user.nombre) {
        user.nombre = nombre;
      }
      if (apellido && !user.apellido) {
        user.apellido = apellido;
      }
      // Solo actualizar imagen si viene una y el usuario no tiene
      if (imagen_perfil && !user.imagen_perfil_id) {
        user.imagen_perfil_id = imagen_perfil;
      }
      await user.save();

      res.status(200).json({
        success: true,
        user
      });
      return;
    }

    // Si no existe, crear usuario
    // Generar contraseña aleatoria para usuarios de Google/Firebase
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await User.create({
      nombre: nombre || email.split('@')[0],
      apellido: apellido || '',
      email,
      contrasena: hashedPassword,
      verificacion: false,
      uid,
      imagen_perfil_id: imagen_perfil || null,
    });

    res.status(201).json({
      success: true,
      user: newUser
    });
    return;

  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ success: false, message: "Error syncing user", error });
    return;
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    
    if (!uid) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const { nombre, apellido, fecha_nacimiento } = req.body;

    // Buscar usuario por UID o email como respaldo
    let user = await User.findOne({ where: { uid } });
    
    if (!user && email) {
      user = await User.findOne({ where: { email } });
      if (user) {
        user.uid = uid;
      }
    }
    
    if (!user) {
      res.status(404).json({ success: false, message: "Usuario no encontrado" });
      return;
    }

    // Actualizar campos si se proporcionan
    if (nombre !== undefined) user.nombre = nombre;
    if (apellido !== undefined) user.apellido = apellido;
    if (fecha_nacimiento !== undefined) user.fecha_nacimiento = fecha_nacimiento;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: user.toJSON()
    });
    return;
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Error al actualizar perfil", error });
    return;
  }
};

export const uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    
    if (!uid) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, message: "No se proporcionó imagen" });
      return;
    }

    // Buscar usuario por UID o email como respaldo
    let user = await User.findOne({ where: { uid } });
    
    if (!user && email) {
      user = await User.findOne({ where: { email } });
      if (user) {
        user.uid = uid;
      }
    }
    
    if (!user) {
      res.status(404).json({ success: false, message: "Usuario no encontrado" });
      return;
    }

    // Guardar la imagen como data URL directamente en la base de datos
    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
    user.imagen_perfil_id = dataUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Imagen de perfil actualizada",
      imageUrl: dataUrl,
      user: user.toJSON()
    });
    return;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ success: false, message: "Error al subir imagen de perfil", error });
    return;
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    
    console.log("getProfile - uid:", uid, "email:", email);
    
    if (!uid) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    // Buscar por UID o por email como respaldo
    let user = await User.findOne({ where: { uid } });
    console.log("getProfile - found by uid:", user?.email);
    
    if (!user && email) {
      user = await User.findOne({ where: { email } });
      console.log("getProfile - found by email:", user?.email);
      // Si encontramos por email, actualizar el UID
      if (user) {
        user.uid = uid;
        await user.save();
      }
    }
    
    if (!user) {
      console.log("getProfile - user not found with uid:", uid, "or email:", email);
      res.status(404).json({ success: false, message: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({
      success: true,
      user: user.toJSON()
    });
    return;
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ success: false, message: "Error al obtener perfil", error });
    return;
  }
};