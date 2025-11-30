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
} from "sequelize-typescript"
import { User } from "./User"

@Table({
  tableName: "verificacion_identidad",
  timestamps: false,
})
export class VerificacionIdentidad extends Model<VerificacionIdentidad> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  verificacion_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  usuario_id!: number

  @AllowNull(false)
  @Column(DataType.TEXT)
  imagen_dni!: string

  @AllowNull(false)
  @Column(DataType.STRING(50))
  tipo_verificacion!: string // "escaneado" o "subida"

  @Default("pendiente")
  @AllowNull(false)
  @Column(DataType.STRING(50))
  estado!: string // "pendiente", "aprobado", "rechazado"

  @AllowNull(true)
  @Column(DataType.TEXT)
  razon_rechazo?: string | null

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column(DataType.DATE)
  fecha_creacion!: Date

  @AllowNull(true)
  @Column(DataType.DATE)
  fecha_verificacion?: Date | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  edad_extraida?: number | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  numero_documento?: string | null

  // Associations
  @BelongsTo(() => User, { foreignKey: 'usuario_id', targetKey: 'usuario_id' })
  usuario?: User
}

export default VerificacionIdentidad
