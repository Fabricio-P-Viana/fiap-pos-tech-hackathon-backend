import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import type { CreateAttachmentDTO } from "../dtos/CreateAttachmentDTO.ts";
import { ensureAttachmentWriteAccess } from "./ensureAttachmentWriteAccess.ts";

export class CreateAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(dto: CreateAttachmentDTO, actor: Actor): Promise<Attachment> {
    const occurrence = await this.occurrenceRepository.findById(
      dto.occurrenceId
    );
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", dto.occurrenceId);

    ensureAttachmentWriteAccess(occurrence, actor);

    return this.attachmentRepository.create(dto);
  }
}
