require("dotenv").config();

const shouldUseSSL =
  process.env.DB_SSL === "true" ||
  (process.env.DATABASE_URL || "").includes("render.com");

const shared = {
  dialect: "postgres",
  dialectOptions: shouldUseSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
};

module.exports = process.env.DATABASE_URL
  ? {
      ...shared,
      use_env_variable: "DATABASE_URL",
    }
  : {
      ...shared,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "postgres",
      database: process.env.DB_NAME || "blog",
      host: process.env.DB_HOST || "db",
    };
