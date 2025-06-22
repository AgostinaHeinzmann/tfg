import dotenv from "dotenv"

dotenv.config()

interface DatabaseConfig {
  username: string
  password: string
  database: string
  host: string
  port: number
  dialect: "postgres" | "mysql" | "mariadb" | "sqlite" | "mssql"
  logging?: boolean | ((sql: string) => void)
  dialectOptions?: any
}

interface Config {
  development: DatabaseConfig
  test: DatabaseConfig
  production: DatabaseConfig
}

const config: Config = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "express_mvc_db",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    dialect: (process.env.DB_DIALECT as any) || "postgres",
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: (process.env.DB_NAME || "express_mvc_db") + "_test",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    dialect: (process.env.DB_DIALECT as any) || "postgres",
    logging: false,
  },
  production: {
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    dialect: (process.env.DB_DIALECT as any) || "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
}

export default config
