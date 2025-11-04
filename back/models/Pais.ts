import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
} from "sequelize-typescript"

@Table({
  tableName: "pais",
  timestamps: false,
})
export class Pais extends Model<Pais> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  pais_id!: number

  @AllowNull(false)
  @Column(DataType.STRING(100))
  nombre!: string
}

export default Pais