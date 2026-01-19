import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Ciudad } from "../models/Ciudad";
import { Comentario } from "../models/Comentario";
import { Direccion } from "../models/Direccion";
import { Event } from "../models/Event";
import { EventUser } from "../models/EventUser";
import { InscripcionEvent } from "../models/InscripcionEvent";
import { Interes } from "../models/Interes";
import { Itinerary } from "../models/Itinerario";
import { ItinerarioDia } from "../models/ItinerarioDia";
import { ItinerarioUser } from "../models/ItinerarioUser";
import { MensajeEvent } from "../models/MensajeEvent";
import { Pais } from "../models/Pais";
import { Publicacion } from "../models/Publicacion";
import { PublicacionImagen } from "../models/PublicacionImagen";
dotenv.config();

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging:false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  models: [
    User,
    Ciudad,
    Comentario,
    Direccion,
    Event,
    EventUser,
    InscripcionEvent,
    Interes,
    Itinerary,
    ItinerarioDia,
    ItinerarioUser,
    MensajeEvent,
    Pais,
    Publicacion,
    PublicacionImagen,
  ],
});
