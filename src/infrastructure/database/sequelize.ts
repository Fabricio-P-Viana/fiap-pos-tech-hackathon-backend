import { Dialect, Sequelize } from "sequelize";
import createUserModel from "./models/UserModel.ts";
import createCategoryModel from "./models/CategoryModel.ts";
import createOccurrenceModel from "./models/OccurrenceModel.ts";
import createOccurrenceEventModel from "./models/OccurrenceEventModel.ts";
import createCommentModel from "./models/CommentModel.ts";
import createAttachmentModel from "./models/AttachmentModel.ts";
import createRatingModel from "./models/RatingModel.ts";
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
const CategoryModel = createCategoryModel(sequelize);
const OccurrenceModel = createOccurrenceModel(sequelize);
const OccurrenceEventModel = createOccurrenceEventModel(sequelize);
const CommentModel = createCommentModel(sequelize);
const AttachmentModel = createAttachmentModel(sequelize);
const RatingModel = createRatingModel(sequelize);

UserModel.hasMany(OccurrenceModel, {
  foreignKey: "requesterId",
  as: "requestedOccurrences",
});

UserModel.hasMany(OccurrenceModel, {
  foreignKey: "assigneeId",
  as: "assignedOccurrences",
});

UserModel.hasMany(OccurrenceEventModel, {
  foreignKey: "actorId",
  as: "occurrenceEvents",
});

UserModel.hasMany(CommentModel, { foreignKey: "authorId", as: "comments" });
UserModel.hasMany(RatingModel, { foreignKey: "authorId", as: "ratings" });

CategoryModel.hasMany(OccurrenceModel, {
  foreignKey: "categoryId",
  as: "occurrences",
});

OccurrenceModel.belongsTo(UserModel, {
  foreignKey: "requesterId",
  as: "requester",
});

OccurrenceModel.belongsTo(UserModel, {
  foreignKey: "assigneeId",
  as: "assignee",
});

OccurrenceModel.belongsTo(CategoryModel, {
  foreignKey: "categoryId",
  as: "category",
});

OccurrenceModel.hasMany(OccurrenceEventModel, {
  foreignKey: "occurrenceId",
  as: "events",
});

OccurrenceModel.hasMany(CommentModel, {
  foreignKey: "occurrenceId",
  as: "comments",
});

OccurrenceModel.hasMany(AttachmentModel, {
  foreignKey: "occurrenceId",
  as: "attachments",
});

OccurrenceModel.hasOne(RatingModel, {
  foreignKey: "occurrenceId",
  as: "rating",
});

OccurrenceEventModel.belongsTo(OccurrenceModel, {
  foreignKey: "occurrenceId",
  as: "occurrence",
});

OccurrenceEventModel.belongsTo(UserModel, {
  foreignKey: "actorId",
  as: "actor",
});

CommentModel.belongsTo(OccurrenceModel, {
  foreignKey: "occurrenceId",
  as: "occurrence",
});

CommentModel.belongsTo(UserModel, { foreignKey: "authorId", as: "author" });

AttachmentModel.belongsTo(OccurrenceModel, {
  foreignKey: "occurrenceId",
  as: "occurrence",
});

RatingModel.belongsTo(OccurrenceModel, {
  foreignKey: "occurrenceId",
  as: "occurrence",
});

RatingModel.belongsTo(UserModel, { foreignKey: "authorId", as: "author" });

export {
  sequelize,
  UserModel,
  CategoryModel,
  OccurrenceModel,
  OccurrenceEventModel,
  CommentModel,
  AttachmentModel,
  RatingModel,
};
