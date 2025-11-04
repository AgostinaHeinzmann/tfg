import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript"
import Ciudad from "./Ciudad"
import Event from "./Event"
import ItinerarioDia from "./ItinerarioDia"

@Table({
  tableName: "direccion",
  timestamps: false,
})
export class Direccion extends Model<Direccion> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  direccion_id!: number

  @ForeignKey(() => Ciudad)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  ciudad_id!: number

  @AllowNull(false)
  @Column(DataType.STRING(150))
  calle!: string

  @AllowNull(false)
  @Column(DataType.STRING(20))
  numero!: string

  // Associations
  @BelongsTo(() => Ciudad, { foreignKey: 'ciudad_id', targetKey: 'ciudad_id' })
  ciudad?: Ciudad

  @HasMany(() => Event, { sourceKey: 'direccion_id', foreignKey: 'direccion_id' })
  eventos?: Event[]

  @HasMany(() => ItinerarioDia, { sourceKey: 'direccion_id', foreignKey: 'direccion_id' })
  itinerariosDias?: ItinerarioDia[]
}

export default Direccion