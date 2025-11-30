import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
  BelongsTo,
} from "sequelize-typescript"
import Publicacion from "./Publicacion"

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

  // Associations
  @BelongsTo(() => Publicacion, { foreignKey: 'publicacion_id', targetKey: 'publicacion_id' })
  publicacion?: Publicacion
}

export default PublicacionImagen