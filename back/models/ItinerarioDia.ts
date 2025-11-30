import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, AllowNull, BelongsTo } from "sequelize-typescript"
import Itinerary from "./Itinerario"
import Direccion from "./Direccion"

@Table({ tableName: "itinerario_por_dia", timestamps: false })
export class ItinerarioDia extends Model<ItinerarioDia> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  itinerario_por_dia_id!: number

  @ForeignKey(() => Itinerary)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  itinerario_id!: number

  @ForeignKey(() => Direccion)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  direccion_id!: number

  @AllowNull(true)
  @Column(DataType.STRING(100))
  nombre?: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  descripcion?: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  enlace_oficial?: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  imagen?: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  interes?: string | null

  // Associations
  @BelongsTo(() => Itinerary, { foreignKey: 'itinerario_id', targetKey: 'itinerario_id' })
  itinerario?: Itinerary

  @BelongsTo(() => Direccion, { foreignKey: 'direccion_id', targetKey: 'direccion_id' })
  direccion?: Direccion
}
export default ItinerarioDia