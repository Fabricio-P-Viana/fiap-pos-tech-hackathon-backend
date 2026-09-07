import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class FindOneByIdAttachmentUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}
  async execute(id: number): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) throw new ResourceNotFoundError("Attachment", id);
    return attachment;
  }
}
