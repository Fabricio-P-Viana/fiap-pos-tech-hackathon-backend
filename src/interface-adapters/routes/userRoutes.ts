import { Router } from "express";
import UserController from "../controllers/UserController.ts";
import { UserModel } from "../../infrastructure/database/sequelize.ts";
import SequelizeUserRepository from "../../infrastructure/repositories/postgresql/SequelizeUserRepository.ts";
import {
  CreateUserUseCase,
  FindAllUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  FindOneByIdUserUseCase,
  FindUsersByRoleUseCase,
  CreateManagerUseCase,
} from "../../application/user/use-cases/index.ts";
import { AuthService } from "../../domain/services/AuthService.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import { authorize } from "../middlewares/authorize.ts";
import { UserRole } from "../../domain/entities/User.ts";

export class UserRoutes {
  private userController: UserController;
  private repository: SequelizeUserRepository;
  private authService: AuthService;
  private userRoutes: Router;

  constructor(authService: AuthService) {
    this.authService = authService;

    this.userRoutes = Router();

    this.repository = new SequelizeUserRepository(UserModel);

    // Composition Root: monta as dependências e injeta no controller
    this.userController = new UserController(
      new CreateUserUseCase(this.repository, this.authService),
      new FindAllUserUseCase(this.repository),
      new UpdateUserUseCase(this.repository, this.authService),
      new DeleteUserUseCase(this.repository),
      new FindOneByIdUserUseCase(this.repository),
      new FindUsersByRoleUseCase(this.repository),
      new CreateManagerUseCase(this.repository, this.authService)
    );
  }

  getRouter(): Router {
    /**
     * @swagger
     * /users:
     *   post:
     *     tags: [User]
     *     summary: Criar um novo usuário
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserInput'
     *     responses:
     *       201:
     *         description: Usuário criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Dados inválidos
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.post("/", (req, res, next) =>
      this.userController.createUser({ req, res, next })
    );

    /**
     * @swagger
     * /users/managers:
     *   post:
     *     tags: [User]
     *     summary: Criar um novo gestor
     *     security:
     *     - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserInput'
     *     responses:
     *       201:
     *         description: Gestor criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Token não fornecido ou inválido
     *       403:
     *         description: Sem permissão para criar gestores
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.post(
      "/managers",
      authMiddleware(this.authService),
      authorize(UserRole.MANAGER),
      (req, res, next) => this.userController.createManager({ req, res, next })
    );

    /**
     * @swagger
     * /users:
     *   get:
     *     tags: [User]
     *     summary: Listar todos os usuários
     *     security:
     *     - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuários
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.get(
      "/",
      authMiddleware(this.authService),
      authorize(UserRole.MANAGER),
      (req, res, next) => this.userController.findAllUsers({ req, res, next })
    );

    /**
     * @swagger
     * /users/role:
     *   get:
     *     tags: [User]
     *     summary: Buscar usuários por role (REQUESTER ou MANAGER)
     *     parameters:
     *       - in: query
     *         name: role
     *         required: true
     *         schema:
     *           type: string
     *           enum: [REQUESTER, MANAGER]
     *         description: Role utilizada para filtrar os usuários
     *     security:
     *     - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuários com a role informada
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *       400:
     *         description: Parâmetro "role" é obrigatório ou inválido
     *       401:
     *         description: Token não fornecido ou inválido
     *       403:
     *         description: Sem permissão para listar usuários
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.get(
      "/role",
      authMiddleware(this.authService),
      authorize(UserRole.MANAGER),
      (req, res, next) =>
        this.userController.findUsersByRole({ req, res, next })
    );

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     tags: [User]
     *     summary: Buscar usuário por ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *     security:
     *      - bearerAuth: []
     *     responses:
     *       200:
     *         description: Usuário encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Usuário não encontrado
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.get(
      "/:id",
      authMiddleware(this.authService),
      authorize(UserRole.MANAGER),
      (req, res, next) => this.userController.findUserById({ req, res, next })
    );

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     tags: [User]
     *     summary: Atualizar um usuário
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserInput'
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Usuário não encontrado
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.put(
      "/:id",
      authMiddleware(this.authService),
      (req, res, next) => this.userController.updateUser({ req, res, next })
    );

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     tags: [User]
     *     summary: Deletar um usuário
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       204:
     *         description: Usuário deletado com sucesso
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Usuário não encontrado
     *       500:
     *         description: Erro interno do servidor
     */
    this.userRoutes.delete(
      "/:id",
      authMiddleware(this.authService),
      (req, res, next) => this.userController.deleteUser({ req, res, next })
    );

    return this.userRoutes;
  }
}
