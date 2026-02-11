import admin from "../config/firebase";
import type { RequestHandler } from "express";
import { ApiResponse } from "types/api";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

const auth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: "Acceso denegado",
      };
      res.status(401).json(response);
      return;
    }

    const decodeValue = await admin.auth().verifyIdToken(token);
    
    if (!decodeValue) {
      res.status(401).json({message: 'Token inválido'});
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      uid: decodeValue.uid,
      email: decodeValue.email,
    };

    // Token válido, continuar
    next();
  } catch (error) {
    res.status(401).json({message: 'Acceso denegado'});
  }
};

export default auth;