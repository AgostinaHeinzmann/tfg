import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
} from "sequelize-typescript"
import { Publicacion } from "./Publicacion"

@Table({
  tableName: "publicacion_imagen",
  timestamps: false,
})
export class PublicacionImagen extends Model<PublicacionImagen> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  publicacion_imagen_id!: number

  @ForeignKey(() => Publicacion)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  publicacion_id!: number

  @AllowNull(true)
  @Column(DataType.INTEGER)
  imagen_id?: number | null
}

export default PublicacionImagen