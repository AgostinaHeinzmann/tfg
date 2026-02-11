import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import { sequelize } from "./config/database"

import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"
import auth from "./middlewares/auth"
import eventRoutes from "./routes/eventRoutes"
import filtrosRoutes from "./routes/filtrosRoutes"
import itinerarioRoutes from "./routes/itinerarioRoutes"
import feedRoutes from "./routes/feedRoutes"
import verificacionIdentidadRoutes from "./routes/verificacionIdentidadRoutes"
import chatRoutes from "./routes/chatRoutes"

dotenv.config();

const app = express()

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsear JSON (sin requerir Content-Type)
app.use(express.json({
  limit: '50mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware para verificar headers y body
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  console.log("Content-Type:", req.get('content-type'));
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Rutas públicas (sin autenticación)
app.use("/auth", authRoutes)

// Middleware de autenticación para rutas protegidas
app.use(auth);

// Rutas protegidas (requieren autenticación)
app.use("/users", userRoutes)
app.use("/event", eventRoutes)
app.use("/filtros", filtrosRoutes)
app.use("/itinerario", itinerarioRoutes)
app.use("/feed", feedRoutes)
app.use("/verificacion", verificacionIdentidadRoutes)
app.use("/chat", chatRoutes)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database connected and synced successfully');
    })
    .catch(err => console.error('Unable to connect to the database:', err));
});

