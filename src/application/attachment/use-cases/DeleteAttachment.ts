import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class DeleteAttachmentUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}
  async execute(id: number): Promise<void> {
    if (!(await this.attachmentRepository.delete(id)))
      throw new ResourceNotFoundError("Attachment", id);
  }
}
