import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, AllowNull } from "sequelize-typescript"
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
}
export default ItinerarioDia