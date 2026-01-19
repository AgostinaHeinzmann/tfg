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
      // Si el usuario existe pero no tiene UID (registrado antes de Firebase o solo email), actualizar UID
      if (!user.uid) {
        user.uid = uid;
        await user.save();
      }

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