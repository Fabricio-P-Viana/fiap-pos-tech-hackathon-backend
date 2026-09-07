import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";

export interface AttachmentAttributes {
  id?: number;
  occurrenceId: number;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AttachmentModel
  extends Model<AttachmentAttributes>
  implements AttachmentAttributes
{
  declare id: number;
  declare occurrenceId: number;
  declare filePath: string;
  declare mimeType: string;
  declare sizeBytes: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createAttachmentModel(
  sequelize: Sequelize
): ModelStatic<AttachmentModel> {
  AttachmentModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      occurrenceId: { type: DataTypes.INTEGER, allowNull: false },
      filePath: { type: DataTypes.STRING(300), allowNull: false },
      mimeType: { type: DataTypes.STRING(60), allowNull: false },
      sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Attachment",
      tableName: "attachments",
      timestamps: true,
    }
  );

  return AttachmentModel as ModelStatic<AttachmentModel>;
}
