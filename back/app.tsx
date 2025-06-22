import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Importar configuración de base de datos
import { sequelize } from "./config/database"

// Importar rutas
import userRoutes from "./routes/userRoutes"
import authRoutes from "./routes/authRoutes"

// Importar middlewares
import errorHandler from "./middlewares/errorHandler"
import notFound from "./middlewares/notFound"

dotenv.config()

const app = express()

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
})

// Middlewares globales
app.use(helmet()) // Seguridad
app.use(cors()) // CORS
app.use(morgan("combined")) // Logging
app.use(limiter) // Rate limiting
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos
app.use(express.static("public"))

// Rutas principales
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

// Ruta de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Middlewares de manejo de errores (deben ir al final)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3000

// Función para iniciar el servidor
const startServer = async (): Promise<void> => {
  try {
    // Sincronizar base de datos
    await sequelize.authenticate()
    console.log("✅ Database connection established successfully.")

    // Sincronizar modelos (en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      console.log("✅ Database synchronized.")
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("❌ Unable to start server:", error)
    process.exit(1)
  }
}

startServer()

export default app
