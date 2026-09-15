import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { StorageService } from "../../../domain/services/StorageService.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { ensureAttachmentWriteAccess } from "./ensureAttachmentWriteAccess.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadOccurrenceAttachmentInput {
  occurrenceId: number;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export class UploadOccurrenceAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(
    input: UploadOccurrenceAttachmentInput,
    actor: Actor
  ): Promise<Attachment> {
    const occurrence = await this.occurrenceRepository.findById(
      input.occurrenceId
    );
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", input.occurrenceId);

    ensureAttachmentWriteAccess(occurrence, actor);

    if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
      throw new ValidationError(
        `File type not allowed. Accepted types: ${ALLOWED_MIME_TYPES.join(", ")}`
      );
    }
    if (input.sizeBytes > MAX_SIZE_BYTES) {
      throw new ValidationError(
        `File too large. Maximum size is ${MAX_SIZE_BYTES / (1024 * 1024)}MB`
      );
    }

    const extension = input.originalName.split(".").pop() ?? "bin";
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    let uploaded;
    try {
      uploaded = await this.storageService.upload({
        buffer: input.buffer,
        fileName,
        mimeType: input.mimeType,
        folder: `occurrences/${input.occurrenceId}`,
      });
    } catch (error) {
      throw new ValidationError(
        `Failed to upload file to storage: ${(error as Error).message}`
      );
    }

    try {
      return await this.attachmentRepository.create({
        occurrenceId: input.occurrenceId,
        filePath: uploaded.path,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      });
    } catch (error) {
      // Evita anexo órfão: se a persistência falhar, remove o arquivo já
      // enviado ao Storage.
      await this.storageService.remove(uploaded.path).catch(() => undefined);
      throw error;
    }
  }
}
