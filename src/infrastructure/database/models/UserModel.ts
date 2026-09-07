import { DataTypes, Model, Sequelize, type ModelStatic } from "sequelize";

export enum UserRole {
  REQUESTER = "REQUESTER",
  MANAGER = "MANAGER",
}

export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel extends Model<UserAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function createUserModel(
  sequelize: Sequelize,
): ModelStatic<UserModel> {
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(UserRole.MANAGER, UserRole.REQUESTER),
        allowNull: false,
        defaultValue: UserRole.REQUESTER,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    },
  );

  return UserModel as ModelStatic<UserModel>;
}
