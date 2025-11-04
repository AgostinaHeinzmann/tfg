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
import Itinerary from "./Itinerario"
import Event from "./Event"

@Table({
  tableName: "interes",
  timestamps: false,
})
export class Interes extends Model<Interes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  interes_id!: number

  @ForeignKey(() => Itinerary)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  itinerario_id?: number | null

  @ForeignKey(() => Event)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  evento_id?: number | null

  @AllowNull(true)
  @Column(DataType.STRING(50))
  tipo?: string | null
}

export default Interes