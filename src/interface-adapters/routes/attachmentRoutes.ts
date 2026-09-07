import { Router } from "express";
import AttachmentController from "../controllers/AttachmentController.ts";
import {
  AttachmentModel,
  OccurrenceModel,
} from "../../infrastructure/database/sequelize.ts";
import SequelizeAttachmentRepository from "../../infrastructure/repositories/postgresql/SequelizeAttachmentRepository.ts";
import SequelizeOccurrenceRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceRepository.ts";
import { CreateAttachmentUseCase } from "../../application/attachment/use-cases/CreateAttachment.ts";
import { FindAllAttachmentUseCase } from "../../application/attachment/use-cases/FindAllAttachment.ts";
import { FindOneByIdAttachmentUseCase } from "../../application/attachment/use-cases/FindOneByIdAttachment.ts";
import { UpdateAttachmentUseCase } from "../../application/attachment/use-cases/UpdateAttachment.ts";
import { DeleteAttachmentUseCase } from "../../application/attachment/use-cases/DeleteAttachment.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import type { AuthService } from "../../domain/services/AuthService.ts";

export class AttachmentRoutes {
  private readonly router: Router;

  constructor(authService: AuthService) {
    this.router = Router();
    const attachmentRepository = new SequelizeAttachmentRepository(
      AttachmentModel
    );
    const occurrenceRepository = new SequelizeOccurrenceRepository(
      OccurrenceModel
    );
    const controller = new AttachmentController(
      new CreateAttachmentUseCase(attachmentRepository, occurrenceRepository),
      new FindAllAttachmentUseCase(attachmentRepository),
      new FindOneByIdAttachmentUseCase(attachmentRepository),
      new UpdateAttachmentUseCase(attachmentRepository),
      new DeleteAttachmentUseCase(attachmentRepository)
    );
    this.router.use(authMiddleware(authService));
    /**
     * @swagger
     * /attachments:
     *   post:
     *     tags: [Attachment]
     *     summary: Adicionar anexo a uma ocorrência
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content: { application/json: { schema: { $ref: '#/components/schemas/AttachmentInput' } } }
     *     responses:
     *       201: { description: Anexo criado }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.post("/", (req, res, next) =>
      controller.create({ req, res, next })
    );
    /**
     * @swagger
     * /attachments:
     *   get:
     *     tags: [Attachment]
     *     summary: Listar anexos
     *     security: [{ bearerAuth: [] }]
     *     responses:
     *       200: { description: Lista de anexos }
     */
    this.router.get("/", (req, res, next) =>
      controller.findAll({ req, res, next })
    );
    /**
     * @swagger
     * /attachments/{id}:
     *   get:
     *     tags: [Attachment]
     *     summary: Buscar anexo por ID
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Anexo encontrado }
     *       404: { description: Anexo não encontrado }
     */
    this.router.get("/:id", (req, res, next) =>
      controller.findById({ req, res, next })
    );
    /**
     * @swagger
     * /attachments/{id}:
     *   put:
     *     tags: [Attachment]
     *     summary: Atualizar anexo
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       200: { description: Anexo atualizado }
     */
    this.router.put("/:id", (req, res, next) =>
      controller.update({ req, res, next })
    );
    /**
     * @swagger
     * /attachments/{id}:
     *   delete:
     *     tags: [Attachment]
     *     summary: Excluir anexo
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: path, name: id, required: true, schema: { type: integer } }
     *     responses:
     *       204: { description: Anexo excluído }
     */
    this.router.delete("/:id", (req, res, next) =>
      controller.delete({ req, res, next })
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
