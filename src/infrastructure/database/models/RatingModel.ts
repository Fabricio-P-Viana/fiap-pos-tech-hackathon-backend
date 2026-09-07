import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";

export interface RatingAttributes {
  id?: number;
  occurrenceId: number;
  authorId: number;
  score: number;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RatingModel
  extends Model<RatingAttributes>
  implements RatingAttributes
{
  declare id: number;
  declare occurrenceId: number;
  declare authorId: number;
  declare score: number;
  declare comment: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createRatingModel(
  sequelize: Sequelize
): ModelStatic<RatingModel> {
  RatingModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      occurrenceId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      authorId: { type: DataTypes.INTEGER, allowNull: false },
      score: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      sequelize,
      modelName: "Rating",
      tableName: "ratings",
      timestamps: true,
    }
  );

  return RatingModel as ModelStatic<RatingModel>;
}
