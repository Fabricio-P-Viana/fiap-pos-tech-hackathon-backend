import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";

export class FindAllAttachmentUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}
  execute(): Promise<Attachment[]> {
    return this.attachmentRepository.findAll();
  }
}
