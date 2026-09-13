import { Attachment } from "../../domain/entities/Attachment.ts";

export interface AttachmentViewModel {
  id?: number;
  occurrenceId: number;
  filePath: string;
  /** URL pública pronta para uso em <img>, quando o Storage a fornece. */
  url: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt?: Date;
}

export default class AttachmentView {
  static render(attachment: Attachment, url?: string): AttachmentViewModel {
    return {
      id: attachment.id,
      occurrenceId: attachment.occurrenceId,
      filePath: attachment.filePath,
      url: url ?? null,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      createdAt: attachment.createdAt,
    };
  }

  static renderMany(
    attachments: Attachment[],
    urlResolver?: (attachment: Attachment) => string | undefined
  ): AttachmentViewModel[] {
    return attachments.map((attachment) =>
      this.render(attachment, urlResolver?.(attachment))
    );
  }
}
