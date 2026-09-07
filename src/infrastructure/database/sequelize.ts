import { Dialect, Sequelize } from "sequelize";
import createUserModel from "./models/UserModel.ts";
import config from "./config.ts";

const sequelize = config.url
  ? new Sequelize(config.url, {
      dialect: config.dialect as Dialect,
      dialectOptions: config.dialectOptions,
      logging: false,
    })
  : new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect as Dialect,
      dialectOptions: config.dialectOptions,
      logging: false,
    });

const UserModel = createUserModel(sequelize);

export { sequelize, UserModel };
