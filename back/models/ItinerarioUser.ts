import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  AllowNull,
} from "sequelize-typescript"
import { User } from "./User"
import Itinerary from "./Itinerario"

@Table({
  tableName: "itinerario_usuario",
  timestamps: false,
})
export class ItinerarioUser extends Model<ItinerarioUser> {
  @PrimaryKey
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @PrimaryKey
  @ForeignKey(() => Itinerary)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  itinerario_id!: number
}

export default ItinerarioUser