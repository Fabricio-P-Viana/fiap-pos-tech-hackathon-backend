import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import type { UpdateAttachmentDTO } from "../dtos/UpdateAttachmentDTO.ts";
import { ensureAttachmentWriteAccess } from "./ensureAttachmentWriteAccess.ts";

export class UpdateAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(
    id: number,
    dto: UpdateAttachmentDTO,
    actor: Actor
  ): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) throw new ResourceNotFoundError("Attachment", id);

    const occurrence = await this.occurrenceRepository.findById(
      attachment.occurrenceId
    );
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", attachment.occurrenceId);

    ensureAttachmentWriteAccess(occurrence, actor);

    const updated = await this.attachmentRepository.update(id, {
      ...(dto.filePath !== undefined && { filePath: dto.filePath }),
      ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
      ...(dto.sizeBytes !== undefined && { sizeBytes: dto.sizeBytes }),
    });
    if (!updated) throw new ResourceNotFoundError("Attachment", id);
    return updated;
  }
}
