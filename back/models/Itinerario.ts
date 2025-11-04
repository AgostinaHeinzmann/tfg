import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
} from "sequelize-typescript"
import Ciudad from "./Ciudad"
import { User } from "./User"

@Table({
  tableName: "itinerario",
  timestamps: false,
})
export class Itinerary extends Model<Itinerary> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  itinerario_id!: number

  @ForeignKey(() => Ciudad)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  ciudad_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @AllowNull(true)
  @Column(DataType.TEXT)
  mensaje?: string | null

  @AllowNull(true)
  @Column(DataType.DATE)
  fecha_viaje?: Date | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  intereses?: string | null

  @Default(false)
  @AllowNull(true)
  @Column(DataType.BOOLEAN)
  itinerarios_populares?: boolean | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  resumen_itinerario?: string | null

  @AllowNull(true)
  @Column(DataType.STRING) // DataType.INTERVAL no existe, usar STRING
  duracion?: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  recomendacion?: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  enlace_oficial?: string | null
}

export default Itinerary