import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import bcrypt from "bcryptjs"

// Definir los atributos del modelo User
export interface UserAttributes {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: "user" | "admin"
  isActive: boolean
  lastLogin?: Date
  createdAt?: Date
  updatedAt?: Date
}

// Definir los atributos opcionales para la creación
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "role" | "isActive" | "lastLogin" | "createdAt" | "updatedAt"> {}

// Definir la clase del modelo
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public firstName!: string
  public lastName!: string
  public email!: string
  public password!: string
  public role!: "user" | "admin"
  public isActive!: boolean
  public lastLogin?: Date

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Método de instancia para verificar contraseña
  public async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
  }

  // Método para obtener datos públicos del usuario
  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() } as UserAttributes
    delete (values as any).password
    return values
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12)
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12)
        }
      },
    },
  },
)

export default User
