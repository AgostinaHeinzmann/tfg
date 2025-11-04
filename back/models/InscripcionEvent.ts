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
import { User } from "./User"

@Table({
  tableName: "inscripcion_evento",
  timestamps: false,
})
export class InscripcionEvent extends Model<InscripcionEvent> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  inscripcion_evento_id!: number

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  evento_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_creacion!: Date
}

export default InscripcionEvent