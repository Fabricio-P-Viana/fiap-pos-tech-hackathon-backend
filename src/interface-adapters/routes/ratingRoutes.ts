import { Router } from "express";
import RatingController from "../controllers/RatingController.ts";
import {
  RatingModel,
  OccurrenceModel,
} from "../../infrastructure/database/sequelize.ts";
import SequelizeRatingRepository from "../../infrastructure/repositories/postgresql/SequelizeRatingRepository.ts";
import SequelizeOccurrenceRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceRepository.ts";
import { CreateRatingUseCase } from "../../application/rating/use-cases/CreateRating.ts";
import { FindAllRatingUseCase } from "../../application/rating/use-cases/FindAllRating.ts";
import { FindOneByIdRatingUseCase } from "../../application/rating/use-cases/FindOneByIdRating.ts";
import { UpdateRatingUseCase } from "../../application/rating/use-cases/UpdateRating.ts";
import { DeleteRatingUseCase } from "../../application/rating/use-cases/DeleteRating.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import type { AuthService } from "../../domain/services/AuthService.ts";

export class RatingRoutes {
  private readonly router: Router;

  constructor(authService: AuthService) {
    this.router = Router();
    const ratingRepository = new SequelizeRatingRepository(RatingModel);
    const occurrenceRepository = new SequelizeOccurrenceRepository(
      OccurrenceModel
    );
    const controller = new RatingController(
      new CreateRatingUseCase(ratingRepository, occurrenceRepository),
      new FindAllRatingUseCase(ratingRepository),
      new FindOneByIdRatingUseCase(ratingRepository),
      new UpdateRatingUseCase(ratingRepository),
      new DeleteRatingUseCase(ratingRepository)
    );
    this.router.use(authMiddleware(authService));
    /**
     * @swagger
     * /ratings:
     *   post:
     *     tags: [Rating]
     *     summary: Avaliar ocorrência resolvida
     *     description: A avaliação só pode ser criada quando a ocorrência estiver RESOLVED.
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/RatingInput' } } }
     *     responses:
     *       201: { description: Avaliação criada }
     *       400: { description: Ocorrência ainda não resolvida }
     */
    this.router.post("/", (req, res, next) =>
      controller.create({ req, res, next })
    );
    /**
     * @swagger
     * /ratings:
     *   get:
     *     tags: [Rating]
     *     summary: Listar avaliações
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200: { description: Lista de avaliações }
     */
    this.router.get("/", (req, res, next) =>
      controller.findAll({ req, res, next })
    );
    /**
     * @swagger
     * /ratings/{id}:
     *   get:
     *     tags: [Rating]
     *     summary: Buscar avaliação por ID
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Avaliação encontrada }
     *       404: { description: Avaliação não encontrada }
     */
    this.router.get("/:id", (req, res, next) =>
      controller.findById({ req, res, next })
    );
    /**
     * @swagger
     * /ratings/{id}:
     *   put:
     *     tags: [Rating]
     *     summary: Atualizar avaliação
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Avaliação atualizada }
     */
    this.router.put("/:id", (req, res, next) =>
      controller.update({ req, res, next })
    );
    /**
     * @swagger
     * /ratings/{id}:
     *   delete:
     *     tags: [Rating]
     *     summary: Excluir avaliação
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       204: { description: Avaliação excluída }
     */
    this.router.delete("/:id", (req, res, next) =>
      controller.delete({ req, res, next })
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
