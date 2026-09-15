import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindOneByIdAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(id: number, actor: Actor): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) throw new ResourceNotFoundError("Attachment", id);

    const occurrence = await this.occurrenceRepository.findById(
      attachment.occurrenceId
    );
    if (!occurrence || !OccurrencePolicy.canView(actor, occurrence)) {
      throw new UnauthorizedError(id);
    }

    return attachment;
  }
}
