import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    PrimaryKey,
    AutoIncrement
} from "sequelize-typescript";
import { User } from "./User";
import Publicacion from "./Publicacion";

@Table({
    tableName: "publicacion_like",
    timestamps: true,
    updatedAt: false
})
export class PublicacionLike extends Model<PublicacionLike> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    like_id!: number;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    usuario_id!: number;

    @ForeignKey(() => Publicacion)
    @Column(DataType.INTEGER)
    publicacion_id!: number;

    @BelongsTo(() => User)
    usuario?: User;

    @BelongsTo(() => Publicacion)
    publicacion?: Publicacion;
}

export default PublicacionLike;
