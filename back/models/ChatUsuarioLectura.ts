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
  BelongsTo,
  Unique,
} from "sequelize-typescript"
import Event from "./Event"
import { User } from "./User"

@Table({
  tableName: "chat_usuario_lectura",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['evento_id', 'usuario_id']
    }
  ]
})
export class ChatUsuarioLectura extends Model<ChatUsuarioLectura> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  chat_usuario_lectura_id!: number

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
  ultima_lectura!: Date

  // Relaciones
  @BelongsTo(() => Event, { foreignKey: 'evento_id', targetKey: 'evento_id' })
  evento?: Event

  @BelongsTo(() => User, { foreignKey: 'usuario_id', targetKey: 'usuario_id' })
  usuario?: User
}

export default ChatUsuarioLectura
