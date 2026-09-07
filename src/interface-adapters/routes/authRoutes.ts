import { Router } from "express";
import AuthController from "../controllers/AuthController.ts";
import { Login } from "../../application/auth/use-cases/index.ts";
import SequelizeUserRepository from "../../infrastructure/repositories/postgresql/SequelizeUserRepository.ts";
import { UserModel } from "../../infrastructure/database/sequelize.ts";
import { JwtAuthService } from "../../infrastructure/auth/services/JwtAuthService.ts";

export class AuthRoutes {
  private authController: AuthController;
  private authService: JwtAuthService;
  private router: Router;

  constructor() {
    this.router = Router();
    this.authService = new JwtAuthService();
    const userRepository = new SequelizeUserRepository(UserModel);

    this.authController = new AuthController(
      new Login(userRepository, this.authService),
    );
  }

  getRouter(): Router {
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     tags: [Auth]
     *     summary: Realizar login e obter token JWT
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginInput'
     *     responses:
     *       200:
     *         description: Login realizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Credenciais inválidas
     *       500:
     *         description: Erro interno do servidor
     */
    this.router.post("/login", (req, res, next) =>
      this.authController.login({ req, res, next }),
    );
    return this.router;
  }
}
