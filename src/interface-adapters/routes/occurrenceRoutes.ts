import { Router } from "express";
import OccurrenceController from "../controllers/OccurrenceController.ts";
import OccurrenceEventView from "../presenters/OccurrenceEventView.ts";
import {
  OccurrenceModel,
  OccurrenceEventModel,
  CategoryModel,
  UserModel,
} from "../../infrastructure/database/sequelize.ts";
import SequelizeOccurrenceRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceRepository.ts";
import SequelizeOccurrenceEventRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceEventRepository.ts";
import SequelizeCategoryRepository from "../../infrastructure/repositories/postgresql/SequelizeCategoryRepository.ts";
import SequelizeUserRepository from "../../infrastructure/repositories/postgresql/SequelizeUserRepository.ts";
import { CreateOccurrenceUseCase } from "../../application/occurrence/use-cases/CreateOccurrence.ts";
import { FindAllOccurrenceUseCase } from "../../application/occurrence/use-cases/FindAllOccurrence.ts";
import { FindOneByIdOccurrenceUseCase } from "../../application/occurrence/use-cases/FindOneByIdOccurrence.ts";
import { UpdateOccurrenceUseCase } from "../../application/occurrence/use-cases/UpdateOccurrence.ts";
import { ChangeOccurrenceStatusUseCase } from "../../application/occurrence/use-cases/ChangeOccurrenceStatus.ts";
import { CancelOccurrenceUseCase } from "../../application/occurrence/use-cases/CancelOccurrence.ts";
import { DeleteOccurrenceUseCase } from "../../application/occurrence/use-cases/DeleteOccurrence.ts";
import { FindAllOccurrenceEventUseCase } from "../../application/occurrence/use-cases/FindAllOccurrenceEvent.ts";
import { FindOccurrenceEventsUseCase } from "../../application/occurrence/use-cases/FindOccurrenceEvents.ts";
import { AssignOccurrenceUseCase } from "../../application/occurrence/use-cases/AssignOccurrence.ts";
import { GetDashboardIndicatorsUseCase } from "../../application/occurrence/use-cases/GetDashboardIndicators.ts";
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
      OccurrenceModel,
      CategoryModel
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
      new UpdateOccurrenceUseCase(
        occurrenceRepository,
        categoryRepository,
        eventRepository
      ),
      new ChangeOccurrenceStatusUseCase(occurrenceRepository, eventRepository),
      new CancelOccurrenceUseCase(occurrenceRepository, eventRepository),
      new DeleteOccurrenceUseCase(occurrenceRepository),
      new FindOccurrenceEventsUseCase(eventRepository, occurrenceRepository),
      new AssignOccurrenceUseCase(
        occurrenceRepository,
        eventRepository,
        new SequelizeUserRepository(UserModel)
      ),
      new GetDashboardIndicatorsUseCase(occurrenceRepository)
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
     *     summary: Listar ocorrências (com filtros e paginação)
     *     description: Solicitantes só visualizam as próprias ocorrências; gestores visualizam todas.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: query, name: status, required: false, schema: { type: string, enum: [OPEN, IN_ANALYSIS, IN_PROGRESS, RESOLVED, CANCELLED] } }
     *       - { in: query, name: priority, required: false, schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] } }
     *       - { in: query, name: categoryId, required: false, schema: { type: integer } }
     *       - { in: query, name: assigneeId, required: false, schema: { type: integer } }
     *       - { in: query, name: search, required: false, schema: { type: string } }
     *       - { in: query, name: createdFrom, required: false, schema: { type: string, format: date-time } }
     *       - { in: query, name: createdTo, required: false, schema: { type: string, format: date-time } }
     *       - { in: query, name: page, required: false, schema: { type: integer, default: 1 } }
     *       - { in: query, name: limit, required: false, schema: { type: integer, default: 20 } }
     *     responses:
     *       200: { description: Lista paginada de ocorrências }
     */
    this.router.get("/", (req, res, next) =>
      this.controller.findAll({ req, res, next })
    );

    /**
     * @swagger
     * /occurrences/dashboard:
     *   get:
     *     tags: [Occurrence]
     *     summary: Indicadores agregados para o painel do gestor
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200: { description: Indicadores de volume, status, prioridade, categoria e tempo médio de resolução }
     *       403: { description: Apenas gestores podem acessar o dashboard }
     */
    this.router.get(
      "/dashboard",
      authorize(UserRole.MANAGER),
      (req, res, next) => this.controller.dashboard({ req, res, next })
    );

    /**
     * @swagger
     * /occurrences/events:
     *   get:
     *     tags: [Occurrence]
     *     summary: Consultar histórico de todas as ocorrências
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
     * /occurrences/{id}/events:
     *   get:
     *     tags: [Occurrence]
     *     summary: Consultar o histórico de uma ocorrência
     *     description: Somente o autor da ocorrência ou um gestor pode consultar.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Timeline ordenada da ocorrência }
     *       403: { description: Usuário não tem acesso a esta ocorrência }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.get("/:id/events", (req, res, next) =>
      this.controller.findEvents({ req, res, next })
    );

    /**
     * @swagger
     * /occurrences/{id}/assignee:
     *   patch:
     *     tags: [Occurrence]
     *     summary: Atribuir responsável (gestor) à ocorrência
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Ocorrência atribuída }
     *       403: { description: Apenas gestores podem atribuir responsáveis }
     */
    this.router.patch(
      "/:id/assignee",
      authorize(UserRole.MANAGER),
      (req, res, next) => this.controller.assign({ req, res, next })
    );

    /**
     * @swagger
     * /occurrences/{id}:
     *   get:
     *     tags: [Occurrence]
     *     summary: Buscar ocorrência por ID
     *     description: Somente o autor da ocorrência ou um gestor pode visualizar.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Ocorrência encontrada, content: { application/json: { schema: { $ref: '#/components/schemas/Occurrence' } } } }
     *       403: { description: Usuário não tem acesso a esta ocorrência }
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
     *     description: >
     *       O solicitante (autor) pode editar título, descrição, categoria e localização
     *       somente enquanto a ocorrência estiver OPEN. O gestor pode editar qualquer campo
     *       enquanto a ocorrência não estiver em um status final (RESOLVED/CANCELLED).
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/OccurrenceUpdateInput' } } }
     *     responses:
     *       200: { description: Ocorrência atualizada }
     *       400: { description: Ocorrência em status final ou campo não permitido para o papel do usuário }
     *       403: { description: Usuário não é o autor nem um gestor }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.put("/:id", (req, res, next) =>
      this.controller.update({ req, res, next })
    );

    /**
     * @swagger
     * /occurrences/{id}/status:
     *   patch:
     *     tags: [Occurrence]
     *     summary: Alterar status da ocorrência (fluxo do gestor)
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
     * /occurrences/{id}/cancel:
     *   patch:
     *     tags: [Occurrence]
     *     summary: Cancelar ocorrência
     *     description: >
     *       O solicitante (autor) só pode cancelar enquanto a ocorrência estiver OPEN.
     *       O gestor pode cancelar qualquer ocorrência que não esteja em status final.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     requestBody:
     *       required: false
     *       content: { application/json: { schema: { type: object, properties: { note: { type: string } } } } }
     *     responses:
     *       200: { description: Ocorrência cancelada }
     *       400: { description: Ocorrência já está em status final }
     *       403: { description: Usuário não pode cancelar esta ocorrência }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.patch("/:id/cancel", (req, res, next) =>
      this.controller.cancel({ req, res, next })
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
