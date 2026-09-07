import express from "express";
import { apiReference } from "@scalar/express-api-reference";
import { UserRoutes } from "./interface-adapters/routes/userRoutes.ts";
import { AuthRoutes } from "./interface-adapters/routes/authRoutes.ts";
import RequestLoggerMiddleware from "./interface-adapters/middlewares/requestLogger.ts";
import ErrorHandlerMiddleware from "./interface-adapters/middlewares/errorHandler.ts";
import { sequelize } from "./infrastructure/database/sequelize.ts";
import corsMiddleware from "./infrastructure/frameworks/cors.ts";
import { JwtAuthService } from "./infrastructure/auth/services/JwtAuthService.ts";
import { swaggerSpec } from "./infrastructure/frameworks/swagger.ts";
import { ApiReferenceConfiguration } from "@scalar/api-reference";

class Server {
  app: express.Application;
  PORT: number | string;

  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3000;
  }

  async init(): Promise<void> {
    try {
      await this.conectToDatabase();
      this.setupMiddlewares();
      this.setupRoutes();
      this.setupErrorHandling();

      this.app.listen(this.PORT, () => {
        console.log(`Server is running on port ${this.PORT}`);
        console.log(
          `Swagger UI available at http://localhost:${this.PORT}/api-docs`
        );
      });
    } catch (error) {
      console.error("Error starting server:", error);
    }
  }

  async conectToDatabase(): Promise<void> {
    await sequelize
      .authenticate()
      .then(() => console.log("Database connected"))
      .catch((err: Error) => {
        console.error("Unable to connect to the database:", err);
        throw err;
      });
  }

  setupMiddlewares(): void {
    this.app.use(RequestLoggerMiddleware);
    this.app.use(corsMiddleware);
    this.app.use(express.json());
  }

  setupRoutes(): void {
    const authService = new JwtAuthService();
    const userRoutes = new UserRoutes(authService).getRouter();
    const authRoutes = new AuthRoutes().getRouter();

    this.setupDocsRoute();
    this.app.use("/users", userRoutes);
    this.app.use("/auth", authRoutes);
  }

  setupDocsRoute(): void {
    this.app.use(
      "/api-docs",
      apiReference({
        spec: {
          content: swaggerSpec,
        },
      } as Partial<ApiReferenceConfiguration>)
    );
  }

  setupErrorHandling(): void {
    this.app.use(ErrorHandlerMiddleware);
  }
}

const server = new Server();

await server.init();
