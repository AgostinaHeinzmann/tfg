import { Request, Response } from "express";
import { Event } from "../models/Event";
import { where, WhereOptions } from "sequelize";
import { Where } from "sequelize/types/utils";
import { Op, fn, col } from "sequelize";
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

    // Obtener todas las ciudades con pais_id para filtrar en el frontend
    const ciudades = await Ciudad.findAll({
      attributes: [['ciudad_id', 'id'], 'nombre', 'pais_id'],
      order: [['nombre', 'ASC']]
    });

    // Obtener todos los intereses únicos por tipo (sin duplicados)
    const intereses = await Interes.findAll({
      attributes: [
        [fn('MIN', col('interes_id')), 'id'],
        'tipo'
      ],
      where: {
        tipo: { [Op.ne]: null }
      },
      group: ['tipo'],
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

// Obtener ciudades filtradas por país
export const getCiudadesByPais = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pais_id } = req.params;

    if (!pais_id || isNaN(Number(pais_id))) {
      res.status(400).json({
        success: false,
        message: "Invalid pais_id"
      });
      return;
    }

    const ciudades = await Ciudad.findAll({
      where: { pais_id: Number(pais_id) },
      attributes: [['ciudad_id', 'id'], 'nombre', 'pais_id'],
      order: [['nombre', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: ciudades
    });

  } catch (error) {
    console.error('Error fetching cities by country:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error fetching cities",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
