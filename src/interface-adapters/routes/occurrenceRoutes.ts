import { Router } from "express";
import OccurrenceController from "../controllers/OccurrenceController.ts";
import OccurrenceEventView from "../presenters/OccurrenceEventView.ts";
import {
  OccurrenceModel,
  OccurrenceEventModel,
  CategoryModel,
} from "../../infrastructure/database/sequelize.ts";
import SequelizeOccurrenceRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceRepository.ts";
import SequelizeOccurrenceEventRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceEventRepository.ts";
import SequelizeCategoryRepository from "../../infrastructure/repositories/postgresql/SequelizeCategoryRepository.ts";
import { CreateOccurrenceUseCase } from "../../application/occurrence/use-cases/CreateOccurrence.ts";
import { FindAllOccurrenceUseCase } from "../../application/occurrence/use-cases/FindAllOccurrence.ts";
import { FindOneByIdOccurrenceUseCase } from "../../application/occurrence/use-cases/FindOneByIdOccurrence.ts";
import { UpdateOccurrenceUseCase } from "../../application/occurrence/use-cases/UpdateOccurrence.ts";
import { ChangeOccurrenceStatusUseCase } from "../../application/occurrence/use-cases/ChangeOccurrenceStatus.ts";
import { DeleteOccurrenceUseCase } from "../../application/occurrence/use-cases/DeleteOccurrence.ts";
import { FindAllOccurrenceEventUseCase } from "../../application/occurrence/use-cases/FindAllOccurrenceEvent.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import { authorize } from "../middlewares/authorize.ts";
import { UserRole } from "../../domain/entities/User.ts";
import type { AuthService } from "../../domain/services/AuthService.ts";

export class OccurrenceRoutes {
  private readonly router: Router;
  private readonly controller: OccurrenceController;
  private readonly findAllEvents: FindAllOccurrenceEventUseCase;

  constructor(authService: AuthService) {
    this.router = Router();
    const occurrenceRepository = new SequelizeOccurrenceRepository(
      OccurrenceModel
    );
    const eventRepository = new SequelizeOccurrenceEventRepository(
      OccurrenceEventModel
    );
    const categoryRepository = new SequelizeCategoryRepository(CategoryModel);
    this.controller = new OccurrenceController(
      new CreateOccurrenceUseCase(
        occurrenceRepository,
        eventRepository,
        categoryRepository
      ),
      new FindAllOccurrenceUseCase(occurrenceRepository),
      new FindOneByIdOccurrenceUseCase(occurrenceRepository),
      new UpdateOccurrenceUseCase(occurrenceRepository, categoryRepository),
      new ChangeOccurrenceStatusUseCase(occurrenceRepository, eventRepository),
      new DeleteOccurrenceUseCase(occurrenceRepository)
    );
    this.findAllEvents = new FindAllOccurrenceEventUseCase(eventRepository);

    this.router.use(authMiddleware(authService));
    /**
     * @swagger
     * /occurrences:
     *   post:
     *     tags: [Occurrence]
     *     summary: Registrar ocorrência
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/OccurrenceInput' } } }
     *     responses:
     *       201: { description: Ocorrência criada com status OPEN, content: { application/json: { schema: { $ref: '#/components/schemas/Occurrence' } } } }
     *       400: { description: Dados inválidos ou categoria indisponível }
     */
    this.router.post("/", (req, res, next) =>
      this.controller.create({ req, res, next })
    );
    /**
     * @swagger
     * /occurrences:
     *   get:
     *     tags: [Occurrence]
     *     summary: Listar ocorrências
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200:
     *         description: Lista de ocorrências
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/Occurrence' }
     */
    this.router.get("/", (req, res, next) =>
      this.controller.findAll({ req, res, next })
    );
    /**
     * @swagger
     * /occurrences/events:
     *   get:
     *     tags: [Occurrence]
     *     summary: Consultar histórico de ocorrências
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200:
     *         description: Histórico de alterações
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/OccurrenceEvent' }
     *       403: { description: Apenas gestores podem consultar o histórico }
     */
    this.router.get(
      "/events",
      authorize(UserRole.MANAGER),
      async (req, res, next) => {
        try {
          res
            .status(200)
            .json(
              OccurrenceEventView.renderMany(await this.findAllEvents.execute())
            );
        } catch (error) {
          next(error);
        }
      }
    );
    /**
     * @swagger
     * /occurrences/{id}:
     *   get:
     *     tags: [Occurrence]
     *     summary: Buscar ocorrência por ID
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Ocorrência encontrada, content: { application/json: { schema: { $ref: '#/components/schemas/Occurrence' } } } }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.get("/:id", (req, res, next) =>
      this.controller.findById({ req, res, next })
    );
    /**
     * @swagger
     * /occurrences/{id}:
     *   put:
     *     tags: [Occurrence]
     *     summary: Atualizar ocorrência
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/OccurrenceUpdateInput' } } }
     *     responses:
     *       200: { description: Ocorrência atualizada }
     *       403: { description: Apenas gestores podem atualizar ocorrências }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.put("/:id", authorize(UserRole.MANAGER), (req, res, next) =>
      this.controller.update({ req, res, next })
    );
    /**
     * @swagger
     * /occurrences/{id}/status:
     *   patch:
     *     tags: [Occurrence]
     *     summary: Alterar status da ocorrência
     *     description: Registra automaticamente a alteração no histórico e respeita as transições permitidas.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/OccurrenceStatusInput' } } }
     *     responses:
     *       200: { description: Status atualizado }
     *       400: { description: Transição inválida ou resolução ausente }
     *       403: { description: Apenas gestores podem alterar status }
     */
    this.router.patch(
      "/:id/status",
      authorize(UserRole.MANAGER),
      (req, res, next) => this.controller.changeStatus({ req, res, next })
    );
    /**
     * @swagger
     * /occurrences/{id}:
     *   delete:
     *     tags: [Occurrence]
     *     summary: Excluir ocorrência
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       204: { description: Ocorrência excluída }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.delete("/:id", authorize(UserRole.MANAGER), (req, res, next) =>
      this.controller.delete({ req, res, next })
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
