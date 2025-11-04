import { Request, Response } from "express";
import { Event } from "../models/Event";
import { where, WhereOptions } from "sequelize";
import { Where } from "sequelize/types/utils";
import { Op } from "sequelize";
import Interes from "models/Interes";
import Direccion from "models/Direccion";
import { Ciudad } from "models/Ciudad";
import Pais from "models/Pais";
import { tr } from "zod/v4/locales";

export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location, interests, ageGroup, date, size, page } = req.query;

  const ageGroups: { [key: number]: [number, number] } = {
    0: [0, 18],
    1: [18, 25],
    2: [25, 35],
    3: [35, 45],
    4: [45, 55],
  };

  const interestsArray = interests ? (interests as string).split(",") : [];
  const ageGroupNumber = ageGroup ? Number(ageGroup) : 0;

  const where: WhereOptions = {
    "$pais.nombre$": location,
    "$ciudad.nombre$": location,
    "$interes.tipo$": { [Op.in]: interestsArray },
    restriccion_edad: {
      [Op.gte]: ageGroups[ageGroupNumber][0],
      [Op.lte]: ageGroups[ageGroupNumber][1],
    },
  };

  const offset: number = page ? Number(page) * Number(size) : 0;
  const limit = Number(size);

  const events = await Event.findAll({
    where,
    offset,
    limit,
    include: [
      {
        model: Interes,
        required: false,
      },
      {
        model: Direccion,
        required: false,
        include: [
          {
            model: Ciudad,
            required: true,
            include: [
              {
                model: Pais,
                required: true,
              },
            ],
          },
        ],
      },
    ],
  });
};

export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {};
