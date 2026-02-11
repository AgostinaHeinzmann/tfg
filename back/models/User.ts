import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  AllowNull,
  HasMany,
} from "sequelize-typescript"
import type { Optional } from "sequelize"
import bcrypt from "bcryptjs"
import { Event } from "./Event"
export interface UserAttributes {
  usuario_id?: number
  uid: string | undefined
  nombre: string
  apellido: string
  verificacion?: boolean
  email: string
  contrasena: string
  imagen_perfil_id?: string | null
  fecha_nacimiento?: Date | null
  fecha_registro?: Date
}

export interface UserCreationAttributes extends Optional<UserAttributes, "usuario_id" | "verificacion" | "imagen_perfil_id" | "fecha_registro" | "fecha_nacimiento"> { }

@Table({
  tableName: "usuario",
  timestamps: false,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  usuario_id!: number

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  uid!: string

  @AllowNull(false)
  @Column(DataType.STRING(50))
  nombre!: string

  @AllowNull(false)
  @Column(DataType.STRING(50))
  apellido!: string

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  verificacion!: boolean

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(150))
  email!: string

  @AllowNull(false)
  @Column(DataType.STRING(200))
  contrasena!: string

  @AllowNull(true)
  @Column(DataType.TEXT)
  imagen_perfil_id?: string | null

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  fecha_nacimiento?: Date | null

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_registro?: Date


  @HasMany(() => Event, { foreignKey: 'usuario_id', sourceKey: 'usuario_id' })
  events?: Event[]


  // Método de instancia para verificar contraseña
  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.contrasena)
  }

  // Método para obtener datos públicos del usuario
  toJSON(): object {
    const values = { ...this.get() }
    delete (values as any).contrasena
    return values
  }
}
