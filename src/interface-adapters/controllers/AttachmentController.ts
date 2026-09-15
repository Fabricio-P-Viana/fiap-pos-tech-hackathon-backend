import type { ReqResNextFunction } from "../types/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { CreateAttachmentDTO } from "../../application/attachment/dtos/CreateAttachmentDTO.ts";
import { UpdateAttachmentDTO } from "../../application/attachment/dtos/UpdateAttachmentDTO.ts";
import type { CreateAttachmentUseCase } from "../../application/attachment/use-cases/CreateAttachment.ts";
import type { FindAllAttachmentUseCase } from "../../application/attachment/use-cases/FindAllAttachment.ts";
import type { FindOneByIdAttachmentUseCase } from "../../application/attachment/use-cases/FindOneByIdAttachment.ts";
import type { FindOccurrenceAttachmentsUseCase } from "../../application/attachment/use-cases/FindOccurrenceAttachments.ts";
import type { UpdateAttachmentUseCase } from "../../application/attachment/use-cases/UpdateAttachment.ts";
import type { DeleteAttachmentUseCase } from "../../application/attachment/use-cases/DeleteAttachment.ts";
import type { UploadOccurrenceAttachmentUseCase } from "../../application/attachment/use-cases/UploadOccurrenceAttachment.ts";
import type { StorageService } from "../../domain/services/StorageService.ts";
import type { Attachment } from "../../domain/entities/Attachment.ts";
import AttachmentView from "../presenters/AttachmentView.ts";
import type { Actor } from "../../domain/services/OccurrencePolicy.ts";

export default class AttachmentController {
  constructor(
    private readonly createAttachmentUseCase: CreateAttachmentUseCase,
    private readonly findAllAttachmentUseCase: FindAllAttachmentUseCase,
    private readonly findOneByIdAttachmentUseCase: FindOneByIdAttachmentUseCase,
    private readonly updateAttachmentUseCase: UpdateAttachmentUseCase,
    private readonly deleteAttachmentUseCase: DeleteAttachmentUseCase,
    private readonly uploadOccurrenceAttachmentUseCase?: UploadOccurrenceAttachmentUseCase,
    private readonly findOccurrenceAttachmentsUseCase?: FindOccurrenceAttachmentsUseCase,
    private readonly storageService?: StorageService
  ) {}

  private parseId(id: string | string[]): number {
    const value = parseInt(Array.isArray(id) ? id[0] : id, 10);
    if (Number.isNaN(value))
      throw new ValidationError("Attachment ID must be a valid number");
    return value;
  }

  private actor(req: ReqResNextFunction["req"]): Actor {
    if (!req.user) throw new ValidationError("Authenticated user is required");
    return { id: req.user.userId, role: req.user.role };
  }

  private publicUrl(attachment: Attachment): string | undefined {
    return this.storageService?.getPublicUrl(attachment.filePath);
  }

  async create({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const attachment = await this.createAttachmentUseCase.execute(
        CreateAttachmentDTO.create(req.body),
        this.actor(req)
      );
      res
        .status(201)
        .json(AttachmentView.render(attachment, this.publicUrl(attachment)));
    } catch (error) {
      next(error);
    }
  }

  async findAll({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const occurrenceIdRaw = req.query.occurrenceId as string | undefined;
      if (occurrenceIdRaw !== undefined) {
        const occurrenceId = parseInt(occurrenceIdRaw, 10);
        if (Number.isNaN(occurrenceId))
          throw new ValidationError("occurrenceId must be a valid number");
        if (!this.findOccurrenceAttachmentsUseCase)
          throw new ValidationError("Attachment listing is not configured");

        const attachments = await this.findOccurrenceAttachmentsUseCase.execute(
          occurrenceId,
          this.actor(req)
        );
        res
          .status(200)
          .json(
            AttachmentView.renderMany(attachments, (attachment) =>
              this.publicUrl(attachment)
            )
          );
        return;
      }

      const attachments = await this.findAllAttachmentUseCase.execute();
      res
        .status(200)
        .json(
          AttachmentView.renderMany(attachments, (attachment) =>
            this.publicUrl(attachment)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async findById({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const attachment = await this.findOneByIdAttachmentUseCase.execute(
        this.parseId(req.params.id),
        this.actor(req)
      );
      res
        .status(200)
        .json(AttachmentView.render(attachment, this.publicUrl(attachment)));
    } catch (error) {
      next(error);
    }
  }

  async update({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const attachment = await this.updateAttachmentUseCase.execute(
        this.parseId(req.params.id),
        UpdateAttachmentDTO.create(req.body),
        this.actor(req)
      );
      res
        .status(200)
        .json(AttachmentView.render(attachment, this.publicUrl(attachment)));
    } catch (error) {
      next(error);
    }
  }

  async delete({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      await this.deleteAttachmentUseCase.execute(
        this.parseId(req.params.id),
        this.actor(req)
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async upload({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      if (!this.uploadOccurrenceAttachmentUseCase) {
        throw new ValidationError("Upload feature is not configured");
      }
      const file = (req as unknown as { file?: Express.Multer.File }).file;
      if (!file) throw new ValidationError("File is required (field 'file')");

      const occurrenceId = parseInt(req.body.occurrenceId, 10);
      if (Number.isNaN(occurrenceId))
        throw new ValidationError("occurrenceId must be a valid number");

      const attachment = await this.uploadOccurrenceAttachmentUseCase.execute(
        {
          occurrenceId,
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        },
        this.actor(req)
      );
      res
        .status(201)
        .json(AttachmentView.render(attachment, this.publicUrl(attachment)));
    } catch (error) {
      next(error);
    }
  }
}
