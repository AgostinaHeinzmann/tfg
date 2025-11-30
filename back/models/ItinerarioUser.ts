import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  AllowNull,
  BelongsTo,
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

  // Associations
  @BelongsTo(() => User, { foreignKey: 'usuario_id', targetKey: 'usuario_id' })
  usuario?: User

  @BelongsTo(() => Itinerary, { foreignKey: 'itinerario_id', targetKey: 'itinerario_id' })
  itinerario?: Itinerary
}

export default ItinerarioUser