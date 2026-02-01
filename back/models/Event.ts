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
  BelongsTo,
  HasMany,
} from "sequelize-typescript"
import { User } from "./User"
import Direccion from "./Direccion"
import MensajeEvent from "./MensajeEvent"
import InscripcionEvent from "./InscripcionEvent"
import EventUser from "./EventUser"
import Interes from "./Interes"

@Table({
  tableName: "evento",
  timestamps: false,
})
export class Event extends Model<Event> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  evento_id!: number

  @ForeignKey(() => Direccion)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  direccion_id?: number | null

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  usuario_id?: number | null

  @AllowNull(true)
  @Column(DataType.STRING(150))
  calle?: string | null

  @AllowNull(true)
  @Column(DataType.STRING(20))
  numero?: string | null

  @AllowNull(true)
  @Column(DataType.TIME)
  horario?: string | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  cant_participantes?: number | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  restriccion_edad?: number | null

  @AllowNull(false)
  @Column(DataType.STRING(150))
  nombre_evento!: string

  @AllowNull(true)
  @Column(DataType.TEXT)
  descripcion_evento?: string | null

  @AllowNull(true)
  @Column(DataType.DATE)
  fecha_inicio?: Date | null

  @AllowNull(true)
  @Column(DataType.STRING)
  duracion?: string | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  imagen_id?: number | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  imagen_base64?: string | null

  @AllowNull(true)
  @Column(DataType.STRING(50))
  imagen_mime_type?: string | null

  // Associations
  @BelongsTo(() => User, { foreignKey: 'usuario_id', targetKey: 'usuario_id' })
  usuario?: User

  @BelongsTo(() => Direccion, { foreignKey: 'direccion_id', targetKey: 'direccion_id' })
  direccion?: Direccion

  @HasMany(() => MensajeEvent, { sourceKey: 'evento_id', foreignKey: 'evento_id' })
  mensajes?: MensajeEvent[]

  @HasMany(() => InscripcionEvent, { sourceKey: 'evento_id', foreignKey: 'evento_id' })
  inscripciones?: InscripcionEvent[]

  @HasMany(() => EventUser, { sourceKey: 'evento_id', foreignKey: 'evento_id' })
  eventUsers?: EventUser[]

  @HasMany(() => Interes, { sourceKey: 'evento_id', foreignKey: 'evento_id' })
  intereses?: Interes[]
}

export default Event