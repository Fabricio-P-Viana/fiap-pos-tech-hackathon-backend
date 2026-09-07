import cors, { type CorsOptions } from "cors";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin: string): boolean => {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === "*") {
      return true;
    }

    if (allowedOrigin.includes("*")) {
      const pattern = `^${allowedOrigin.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`;
      return new RegExp(pattern).test(origin);
    }

    return allowedOrigin === origin;
  });
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permite chamadas sem Origin (healthchecks, server-to-server, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Sem whitelist definida, aceita origem e facilita o uso local.
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // Origem não autorizada: segue sem cabeçalhos CORS, sem quebrar a requisição.
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
