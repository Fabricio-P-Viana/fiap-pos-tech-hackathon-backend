export interface DbConfig {
  url?: string;
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: string;
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
}

const shouldUseSSL =
  process.env.DB_SSL === "true" ||
  (process.env.DATABASE_URL ?? "").includes("render.com");

const config: DbConfig = {
  url: process.env.DATABASE_URL,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "blog",
  host: process.env.DB_HOST || "db",
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

export default config;
