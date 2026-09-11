import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { StorageService } from "../../../domain/services/StorageService.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class DeleteAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly storageService?: StorageService
  ) {}

  async execute(id: number): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) throw new ResourceNotFoundError("Attachment", id);

    const deleted = await this.attachmentRepository.delete(id);
    if (!deleted) throw new ResourceNotFoundError("Attachment", id);

    // Remove o arquivo do Storage após confirmar a exclusão do registro,
    // evitando arquivo órfão. Falhas aqui não devem impedir a resposta,
    // mas são registradas para investigação.
    if (this.storageService) {
      await this.storageService
        .remove(attachment.filePath)
        .catch((error) =>
          console.error(
            `Failed to remove attachment file from storage: ${attachment.filePath}`,
            error
          )
        );
    }
  }
}
