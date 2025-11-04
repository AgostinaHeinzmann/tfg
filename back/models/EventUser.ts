import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, AllowNull } from "sequelize-typescript"
import { User } from "./User"
import Event from "./Event"

@Table({ tableName: "evento_usuario", timestamps: false })
export class EventUser extends Model<EventUser> {
  @PrimaryKey
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @PrimaryKey
  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  evento_id!: number
}
export default EventUser