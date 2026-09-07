import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";

export interface CategoryAttributes {
  id?: number;
  name: string;
  description?: string | null;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CategoryModel
  extends Model<CategoryAttributes>
  implements CategoryAttributes
{
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createCategoryModel(
  sequelize: Sequelize
): ModelStatic<CategoryModel> {
  CategoryModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(240),
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
    }
  );

  return CategoryModel as ModelStatic<CategoryModel>;
}
