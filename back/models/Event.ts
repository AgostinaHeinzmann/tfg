//import { User } from "models"
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

@Table({
  tableName: "evento",
  timestamps: false,
})
export class Event extends Model<Event> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  evento_id!: number

  //@ForeignKey(() => Object) // Reemplaza Object por el modelo Direccion si lo tienes
  @AllowNull(true)
  @Column(DataType.INTEGER)
  direccion_id?: number | null

  //@ForeignKey(() => User) // Reemplaza Object por el modelo User si lo tienes
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

  @Default(false)
  @AllowNull(true)
  @Column(DataType.BOOLEAN)
  evento_oficial?: boolean | null

  @AllowNull(true)
  @Column(DataType.STRING) // Sequelize no tiene DataType.INTERVAL, puedes usar STRING
  duracion?: string | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  imagen_id?: number | null
}

export default Event