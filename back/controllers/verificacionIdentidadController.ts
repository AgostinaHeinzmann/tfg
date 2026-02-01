import { Request, Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/User";

// POST fecha de nacimiento
export const actualizarFechaNacimiento = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  try {
    const [updatedRows] = await User.update(
      { fecha_nacimiento: req.body.fecha_nacimiento, verificacion: true },
      { where: { uid: uid } }
    );
    
    if (updatedRows === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
    } else {
      res.json({ 
        success: true,
        message: "Fecha de nacimiento actualizada correctamente",
        verificacion: true 
      });
    }
  } catch (error) {
    console.error("Error al actualizar la fecha de nacimiento:", error);
    res.status(500).json({ error: "Error al actualizar la fecha de nacimiento" });
  }
};

export const obtenerVerificacion = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  try {
    const user = await User.findOne({ where: { uid: uid }, attributes: ['verificacion'] });
    if (user) {
      res.json({ verificacion: user.verificacion });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener la verificación:", error);
    res.status(500).json({ error: "Error al obtener la verificación" });
  }
};

export const obtenerVerificacionCompleta = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  try {
    const user = await User.findOne({ 
      where: { uid: uid }, 
      attributes: ['verificacion', 'fecha_nacimiento'] 
    });
    
    if (user) {
      let edad: number | undefined;
      
      if (user.fecha_nacimiento) {
        const today = new Date();
        const birthDate = new Date(user.fecha_nacimiento);
        edad = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          edad--;
        }
      }
      
      res.json({ 
        verificacion: user.verificacion,
        fecha_nacimiento: user.fecha_nacimiento,
        edad
      });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener la verificación completa:", error);
    res.status(500).json({ error: "Error al obtener la verificación" });
  }
};