import { Router } from "express";
import CategoryController from "../controllers/CategoryController.ts";
import { CategoryModel } from "../../infrastructure/database/sequelize.ts";
import SequelizeCategoryRepository from "../../infrastructure/repositories/postgresql/SequelizeCategoryRepository.ts";
import { CreateCategoryUseCase } from "../../application/category/use-cases/CreateCategory.ts";
import { FindAllCategoryUseCase } from "../../application/category/use-cases/FindAllCategory.ts";
import { FindOneByIdCategoryUseCase } from "../../application/category/use-cases/FindOneByIdCategory.ts";
import { UpdateCategoryUseCase } from "../../application/category/use-cases/UpdateCategory.ts";
import { DeleteCategoryUseCase } from "../../application/category/use-cases/DeleteCategory.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import { authorize } from "../middlewares/authorize.ts";
import { UserRole } from "../../domain/entities/User.ts";
import type { AuthService } from "../../domain/services/AuthService.ts";

export class CategoryRoutes {
  private readonly router: Router;
  private readonly controller: CategoryController;

  constructor(authService: AuthService) {
    this.router = Router();
    const repository = new SequelizeCategoryRepository(CategoryModel);
    this.controller = new CategoryController(
      new CreateCategoryUseCase(repository),
      new FindAllCategoryUseCase(repository),
      new FindOneByIdCategoryUseCase(repository),
      new UpdateCategoryUseCase(repository),
      new DeleteCategoryUseCase(repository)
    );

    /**
     * @swagger
     * /categories:
     *   get:
     *     tags: [Category]
     *     summary: Listar categorias
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200:
     *         description: Lista de categorias
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/Category' }
     *       401: { description: Token não fornecido ou inválido }
     */
    this.router.get("/", authMiddleware(authService), (req, res, next) =>
      this.controller.findAll({ req, res, next })
    );
    /**
     * @swagger
     * /categories/{id}:
     *   get:
     *     tags: [Category]
     *     summary: Buscar categoria por ID
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Categoria encontrada, content: { application/json: { schema: { $ref: '#/components/schemas/Category' } } } }
     *       404: { description: Categoria não encontrada }
     */
    this.router.get("/:id", authMiddleware(authService), (req, res, next) =>
      this.controller.findById({ req, res, next })
    );
    /**
     * @swagger
     * /categories:
     *   post:
     *     tags: [Category]
     *     summary: Criar categoria
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/CategoryInput' } } }
     *     responses:
     *       201: { description: Categoria criada, content: { application/json: { schema: { $ref: '#/components/schemas/Category' } } } }
     *       403: { description: Apenas gestores podem criar categorias }
     */
    this.router.post(
      "/",
      authMiddleware(authService),
      authorize(UserRole.MANAGER),
      (req, res, next) => this.controller.create({ req, res, next })
    );
    /**
     * @swagger
     * /categories/{id}:
     *   put:
     *     tags: [Category]
     *     summary: Atualizar categoria
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/CategoryUpdateInput' } } }
     *     responses:
     *       200: { description: Categoria atualizada }
     *       404: { description: Categoria não encontrada }
     */
    this.router.put(
      "/:id",
      authMiddleware(authService),
      authorize(UserRole.MANAGER),
      (req, res, next) => this.controller.update({ req, res, next })
    );
    /**
     * @swagger
     * /categories/{id}:
     *   delete:
     *     tags: [Category]
     *     summary: Excluir categoria
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       204: { description: Categoria excluída }
     *       404: { description: Categoria não encontrada }
     */
    this.router.delete(
      "/:id",
      authMiddleware(authService),
      authorize(UserRole.MANAGER),
      (req, res, next) => this.controller.delete({ req, res, next })
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
