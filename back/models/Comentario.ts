import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, Default, BelongsTo } from "sequelize-typescript"
import { User } from "./User"
import Publicacion from "./Publicacion"

@Table({ tableName: "comentario", timestamps: false })
export class Comentario extends Model<Comentario> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  comentario_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @ForeignKey(() => Publicacion)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  publicacion_id!: number

  @AllowNull(false)
  @Column(DataType.TEXT)
  mensaje!: string

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_creacion!: Date

  // Associations
  @BelongsTo(() => User, { foreignKey: 'usuario_id', targetKey: 'usuario_id' })
  usuario?: User

  @BelongsTo(() => Publicacion, { foreignKey: 'publicacion_id', targetKey: 'publicacion_id' })
  publicacion?: Publicacion
}
export default Comentario