import { Request, Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/User";

// POST fecha de nacimiento
export const actualizarFechaNacimiento = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  try {
    const user = await User.update(
      { fecha_nacimiento: req.body.fecha_nacimiento,  verificacion: true
       },
      { where: { uid: uid } }
    );
    res.json(user);
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