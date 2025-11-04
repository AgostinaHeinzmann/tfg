import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
  Default,
} from "sequelize-typescript"
import { User } from "./User"
import Ciudad from "./Ciudad"

@Table({
  tableName: "publicacion",
  timestamps: false,
})
export class Publicacion extends Model<Publicacion> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  publicacion_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @ForeignKey(() => Ciudad)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  ciudad_id?: number | null

  @Default(0)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  me_gusta?: number | null

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_creacion!: Date

  @AllowNull(true)
  @Column(DataType.TEXT)
  descripcion?: string | null
}

export default Publicacion