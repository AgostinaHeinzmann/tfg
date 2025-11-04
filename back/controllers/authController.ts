import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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