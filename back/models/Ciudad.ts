import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript"
import Pais from "./Pais"
import Direccion from "./Direccion"
import Publicacion from "./Publicacion"
import Itinerary from "./Itinerario"

@Table({ tableName: "ciudad", timestamps: false })
export class Ciudad extends Model<Ciudad> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  ciudad_id!: number

  @ForeignKey(() => Pais)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  pais_id!: number

  @AllowNull(false)
  @Column(DataType.STRING(100))
  nombre!: string

  // Associations
  @BelongsTo(() => Pais, { foreignKey: 'pais_id', targetKey: 'pais_id' })
  pais?: Pais

  @HasMany(() => Direccion, { sourceKey: 'ciudad_id', foreignKey: 'ciudad_id' })
  direcciones?: Direccion[]

  @HasMany(() => Publicacion, { sourceKey: 'ciudad_id', foreignKey: 'ciudad_id' })
  publicaciones?: Publicacion[]

  @HasMany(() => Itinerary, { sourceKey: 'ciudad_id', foreignKey: 'ciudad_id' })
  itinerarios?: Itinerary[]
}
export default Ciudad