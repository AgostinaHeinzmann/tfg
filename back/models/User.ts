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
import VerificacionIdentidad from "./VerificacionIdentidad"

export interface UserAttributes {
  usuario_id?: number
  uid: string | undefined
  nombre: string
  apellido: string
  verificacion?: boolean
  email: string
  contrasena: string
  imagen_perfil_id?: string | null
  edad_dni?: number | null
  fecha_registro?: Date
}

export interface UserCreationAttributes extends Optional<UserAttributes, "usuario_id" | "verificacion" | "imagen_perfil_id" | "edad_dni" | "fecha_registro"> {}

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
  @Column(DataType.STRING(500))
  imagen_perfil_id?: string | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  edad_dni?: number | null

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_registro?: Date


  @HasMany(() => Event, { foreignKey: 'usuario_id', sourceKey: 'usuario_id' })
  events?: Event[]

  @HasMany(() => VerificacionIdentidad, { foreignKey: 'usuario_id', sourceKey: 'usuario_id' })
  verificaciones?: VerificacionIdentidad[]

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
