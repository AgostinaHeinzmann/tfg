import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
  Default,
} from "sequelize-typescript"
import Event from "./Event"

@Table({
  tableName: "mensaje_evento",
  timestamps: false,
})
export class MensajeEvent extends Model<MensajeEvent> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  mensaje_evento_id!: number

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  evento_id!: number

  @AllowNull(false)
  @Column(DataType.TEXT)
  mensaje!: string

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_creacion!: Date
}

export default MensajeEvent