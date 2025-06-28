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
import bcrypt from "bcryptjs"
import { Event } from "./Event"

@Table({
  tableName: "usuario",
  timestamps: false,
})
export class User extends Model<User> {
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
