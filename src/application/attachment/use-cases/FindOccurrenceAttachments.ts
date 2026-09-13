import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

/**
 * Lista as imagens de uma ocorrência respeitando o mesmo escopo de leitura da
 * ocorrência: o solicitante vê as próprias, o gestor vê todas.
 */
export class FindOccurrenceAttachmentsUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(occurrenceId: number, actor: Actor): Promise<Attachment[]> {
    const occurrence = await this.occurrenceRepository.findById(occurrenceId);
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", occurrenceId);

    if (!OccurrencePolicy.canView(actor, occurrence)) {
      throw new UnauthorizedError(occurrenceId);
    }

    return this.attachmentRepository.findByOccurrenceId(occurrenceId);
  }
}
