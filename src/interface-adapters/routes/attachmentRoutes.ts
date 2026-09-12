import { Router } from "express";
import AttachmentController from "../controllers/AttachmentController.ts";
import {
  AttachmentModel,
  OccurrenceModel,
  CategoryModel,
} from "../../infrastructure/database/sequelize.ts";
import SequelizeAttachmentRepository from "../../infrastructure/repositories/postgresql/SequelizeAttachmentRepository.ts";
import SequelizeOccurrenceRepository from "../../infrastructure/repositories/postgresql/SequelizeOccurrenceRepository.ts";
import { CreateAttachmentUseCase } from "../../application/attachment/use-cases/CreateAttachment.ts";
import { FindAllAttachmentUseCase } from "../../application/attachment/use-cases/FindAllAttachment.ts";
import { FindOneByIdAttachmentUseCase } from "../../application/attachment/use-cases/FindOneByIdAttachment.ts";
import { UpdateAttachmentUseCase } from "../../application/attachment/use-cases/UpdateAttachment.ts";
import { DeleteAttachmentUseCase } from "../../application/attachment/use-cases/DeleteAttachment.ts";
import { UploadOccurrenceAttachmentUseCase } from "../../application/attachment/use-cases/UploadOccurrenceAttachment.ts";
import { FindOccurrenceAttachmentsUseCase } from "../../application/attachment/use-cases/FindOccurrenceAttachments.ts";
import { createStorageService } from "../../infrastructure/storage/StorageServiceFactory.ts";
import { uploadImage } from "../middlewares/uploadImage.ts";
import { authMiddleware } from "../middlewares/auth.ts";
import { authorize } from "../middlewares/authorize.ts";
import { UserRole } from "../../domain/entities/User.ts";
import type { AuthService } from "../../domain/services/AuthService.ts";

export class AttachmentRoutes {
  private readonly router: Router;

  constructor(authService: AuthService) {
    this.router = Router();
    const attachmentRepository = new SequelizeAttachmentRepository(
      AttachmentModel
    );
    const occurrenceRepository = new SequelizeOccurrenceRepository(
      OccurrenceModel,
      CategoryModel
    );
    const storageService = createStorageService();
    const controller = new AttachmentController(
      new CreateAttachmentUseCase(attachmentRepository, occurrenceRepository),
      new FindAllAttachmentUseCase(attachmentRepository),
      new FindOneByIdAttachmentUseCase(attachmentRepository),
      new UpdateAttachmentUseCase(attachmentRepository),
      new DeleteAttachmentUseCase(attachmentRepository, storageService),
      new UploadOccurrenceAttachmentUseCase(
        attachmentRepository,
        occurrenceRepository,
        storageService
      ),
      new FindOccurrenceAttachmentsUseCase(
        attachmentRepository,
        occurrenceRepository
      ),
      storageService
    );
    this.router.use(authMiddleware(authService));
    /**
     * @swagger
     * /attachments/upload:
     *   post:
     *     tags: [Attachment]
     *     summary: Enviar imagem de evidência para uma ocorrência
     *     description: Upload multipart/form-data (campo "file") persistido no Supabase Storage (ou disco local em desenvolvimento).
     *     security: [{ bearerAuth: [] }]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               occurrenceId: { type: integer }
     *               file: { type: string, format: binary }
     *     responses:
     *       201: { description: Anexo enviado e registrado }
     *       400: { description: Arquivo inválido, tipo não suportado ou tamanho excedido }
     *       403: { description: Usuário não tem acesso à ocorrência }
     *       404: { description: Ocorrência não encontrada }
     */
    this.router.post("/upload", uploadImage, (req, res, next) =>
      controller.upload({ req, res, next })
    );
    /**
     * @swagger
     * /attachments:
     *   post:
     *     tags: [Attachment]
     *     summary: Adicionar anexo a uma ocorrência (registro direto por filePath)
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
     *     summary: Listar anexos de uma ocorrência
     *     description: >
     *       Com "occurrenceId" a listagem respeita o escopo da ocorrência
     *       (solicitante vê as próprias, gestor vê todas). Sem o parâmetro a
     *       listagem é global e restrita a gestores.
     *     security: [{ bearerAuth: [] }]
     *     parameters:
     *       - { in: query, name: occurrenceId, required: false, schema: { type: integer } }
     *     responses:
     *       200: { description: Lista de anexos com URL pública }
     *       403: { description: Usuário não tem acesso à ocorrência }
     */
    this.router.get(
      "/",
      (req, res, next) => {
        // A listagem sem filtro expõe anexos de todas as ocorrências.
        if (req.query.occurrenceId === undefined) {
          return authorize(UserRole.MANAGER)(req, res, next);
        }
        return next();
      },
      (req, res, next) => controller.findAll({ req, res, next })
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
