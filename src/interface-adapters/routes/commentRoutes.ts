import { Router } from "express";
import CommentController from "../controllers/CommentController.ts";
import {
  CommentModel,
  OccurrenceModel,
  CategoryModel,
} from "../../infrastructure/database/sequelize.ts";
import SequelizeCommentRepository from "../../infrastructure/repositories/postgresql/SequelizeCommentRepository.ts";
import SequelizeOccurrenceRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceRepository.ts";
import { CreateCommentUseCase } from "../../application/comment/use-cases/CreateComment.ts";
import { FindAllCommentUseCase } from "../../application/comment/use-cases/FindAllComment.ts";
import { FindOneByIdCommentUseCase } from "../../application/comment/use-cases/FindOneByIdComment.ts";
import { UpdateCommentUseCase } from "../../application/comment/use-cases/UpdateComment.ts";
import { DeleteCommentUseCase } from "../../application/comment/use-cases/DeleteComment.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import type { AuthService } from "../../domain/services/AuthService.ts";

export class CommentRoutes {
  private readonly router: Router;

  constructor(authService: AuthService) {
    this.router = Router();
    const commentRepository = new SequelizeCommentRepository(CommentModel);
    const occurrenceRepository = new SequelizeOccurrenceRepository(
      OccurrenceModel,
      CategoryModel
    );
    const controller = new CommentController(
      new CreateCommentUseCase(commentRepository, occurrenceRepository),
      new FindAllCommentUseCase(commentRepository),
      new FindOneByIdCommentUseCase(commentRepository),
      new UpdateCommentUseCase(commentRepository),
      new DeleteCommentUseCase(commentRepository)
    );
    this.router.use(authMiddleware(authService));
    /**
     * @swagger
     * /comments:
     *   post:
     *     tags: [Comment]
     *     summary: Adicionar comentário a uma ocorrência
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/CommentInput' } } }
     *     responses:
     *       201: { description: Comentário criado, content: { application/json: { schema: { $ref: '#/components/schemas/Comment' } } } }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.post("/", (req, res, next) =>
      controller.create({ req, res, next })
    );
    /**
     * @swagger
     * /comments:
     *   get:
     *     tags: [Comment]
     *     summary: Listar comentários
     *     description: Comentários internos só são retornados para gestores. Use ?occurrenceId= para filtrar por ocorrência.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: query, name: occurrenceId, required: false, schema: { type: integer } }
     *     responses:
     *       200: { description: Lista de comentários }
     */
    this.router.get("/", (req, res, next) =>
      controller.findAll({ req, res, next })
    );
    /**
     * @swagger
     * /comments/{id}:
     *   get:
     *     tags: [Comment]
     *     summary: Buscar comentário por ID
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Comentário encontrado }
     *       404: { description: Comentário não encontrado }
     */
    this.router.get("/:id", (req, res, next) =>
      controller.findById({ req, res, next })
    );
    /**
     * @swagger
     * /comments/{id}:
     *   put:
     *     tags: [Comment]
     *     summary: Atualizar comentário
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Comentário atualizado }
     *       404: { description: Comentário não encontrado }
     */
    this.router.put("/:id", (req, res, next) =>
      controller.update({ req, res, next })
    );
    /**
     * @swagger
     * /comments/{id}:
     *   delete:
     *     tags: [Comment]
     *     summary: Excluir comentário
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       204: { description: Comentário excluído }
     */
    this.router.delete("/:id", (req, res, next) =>
      controller.delete({ req, res, next })
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
