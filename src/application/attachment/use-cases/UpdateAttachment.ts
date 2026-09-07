import type { Attachment } from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { UpdateAttachmentDTO } from "../dtos/UpdateAttachmentDTO.ts";

export class UpdateAttachmentUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}
  async execute(id: number, dto: UpdateAttachmentDTO): Promise<Attachment> {
    const updated = await this.attachmentRepository.update(id, {
      ...(dto.filePath !== undefined && { filePath: dto.filePath }),
      ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
      ...(dto.sizeBytes !== undefined && { sizeBytes: dto.sizeBytes }),
    });
    if (!updated) throw new ResourceNotFoundError("Attachment", id);
    return updated;
  }
}
