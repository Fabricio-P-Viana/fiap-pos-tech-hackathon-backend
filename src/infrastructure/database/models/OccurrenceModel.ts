import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { Priority } from "../../../domain/enums/priority.enum.ts";

export { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
export { Priority as OccurrencePriority } from "../../../domain/enums/priority.enum.ts";

export interface OccurrenceAttributes {
  id?: number;
  requesterId: number;
  assigneeId?: number | null;
  categoryId: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  priority: Priority;
  locationText?: string | null;
  locationReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolution?: string | null;
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OccurrenceModel
  extends Model<OccurrenceAttributes>
  implements OccurrenceAttributes
{
  declare id: number;
  declare requesterId: number;
  declare assigneeId: number | null;
  declare categoryId: number;
  declare title: string;
  declare description: string;
  declare status: OccurrenceStatus;
  declare priority: Priority;
  declare locationText: string | null;
  declare locationReference: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare resolution: string | null;
  declare resolvedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createOccurrenceModel(
  sequelize: Sequelize
): ModelStatic<OccurrenceModel> {
  OccurrenceModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      requesterId: { type: DataTypes.INTEGER, allowNull: false },
      assigneeId: { type: DataTypes.INTEGER, allowNull: true },
      categoryId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM(...Object.values(OccurrenceStatus)),
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM(...Object.values(Priority)),
        allowNull: false,
      },
      locationText: { type: DataTypes.STRING(160), allowNull: true },
      locationReference: { type: DataTypes.STRING(160), allowNull: true },
      latitude: { type: DataTypes.DOUBLE, allowNull: true },
      longitude: { type: DataTypes.DOUBLE, allowNull: true },
      resolution: { type: DataTypes.TEXT, allowNull: true },
      resolvedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Occurrence",
      tableName: "occurrences",
      timestamps: true,
    }
  );

  return OccurrenceModel as ModelStatic<OccurrenceModel>;
}
