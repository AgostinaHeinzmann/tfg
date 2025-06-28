import express from "express"
import dotenv from "dotenv"

// Importar configuración de base de datos
import { sequelize } from "./config/database"

// Importar rutas
import userRoutes from "./routes/userRoutes"
import authRoutes from "./routes/authRoutes"


dotenv.config()

const app = express()


// Rutas principales
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

const PORT = process.env.PORT

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
