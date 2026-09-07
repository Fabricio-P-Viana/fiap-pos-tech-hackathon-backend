import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";

export enum OccurrenceEventType {
  CREATED = "CREATED",
  STATUS_CHANGED = "STATUS_CHANGED",
  PRIORITY_CHANGED = "PRIORITY_CHANGED",
  ASSIGNEE_CHANGED = "ASSIGNEE_CHANGED",
}

export interface OccurrenceEventAttributes {
  id?: number;
  occurrenceId: number;
  type: OccurrenceEventType;
  previousValue?: string | null;
  newValue?: string | null;
  note?: string | null;
  actorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OccurrenceEventModel
  extends Model<OccurrenceEventAttributes>
  implements OccurrenceEventAttributes
{
  declare id: number;
  declare occurrenceId: number;
  declare type: OccurrenceEventType;
  declare previousValue: string | null;
  declare newValue: string | null;
  declare note: string | null;
  declare actorId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createOccurrenceEventModel(
  sequelize: Sequelize
): ModelStatic<OccurrenceEventModel> {
  OccurrenceEventModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      occurrenceId: { type: DataTypes.INTEGER, allowNull: false },
      type: {
        type: DataTypes.ENUM(...Object.values(OccurrenceEventType)),
        allowNull: false,
      },
      previousValue: { type: DataTypes.STRING(60), allowNull: true },
      newValue: { type: DataTypes.STRING(60), allowNull: true },
      note: { type: DataTypes.STRING(500), allowNull: true },
      actorId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "OccurrenceEvent",
      tableName: "occurrence_events",
      timestamps: true,
    }
  );

  return OccurrenceEventModel as ModelStatic<OccurrenceEventModel>;
}
