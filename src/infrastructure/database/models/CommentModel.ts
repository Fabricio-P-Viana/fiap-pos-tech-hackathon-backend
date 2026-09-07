import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";

export interface CommentAttributes {
  id?: number;
  occurrenceId: number;
  authorId: number;
  body: string;
  isInternal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CommentModel
  extends Model<CommentAttributes>
  implements CommentAttributes
{
  declare id: number;
  declare occurrenceId: number;
  declare authorId: number;
  declare body: string;
  declare isInternal: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createCommentModel(
  sequelize: Sequelize
): ModelStatic<CommentModel> {
  CommentModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      occurrenceId: { type: DataTypes.INTEGER, allowNull: false },
      authorId: { type: DataTypes.INTEGER, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      isInternal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      timestamps: true,
    }
  );

  return CommentModel as ModelStatic<CommentModel>;
}
