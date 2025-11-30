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

export const getFilters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Obtener todos los países
    const paises = await Pais.findAll({
      attributes: [['pais_id', 'id'], 'nombre'],
      order: [['nombre', 'ASC']]
    });

    // Obtener todas las ciudades
    const ciudades = await Ciudad.findAll({
      attributes: [['ciudad_id', 'id'], 'nombre'],
      order: [['nombre', 'ASC']]
    });

    // Obtener todos los intereses
    const intereses = await Interes.findAll({
      attributes: [['interes_id', 'id'], 'tipo'],
      order: [['tipo', 'ASC']]
    });

    // Grupos de edad predefinidos
    const ageGroups = [
      { id: 0, label: '0-18' },
      { id: 1, label: '18-25' },
      { id: 2, label: '25-35' },
      { id: 3, label: '35-45' },
      { id: 4, label: '45-55' }
    ];

    res.status(200).json({
      success: true,
      data: {
        paises,
        ciudades,
        intereses,
        ageGroups
      }
    });

  } catch (error) {
    console.error('Error fetching filters:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching filters",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};


