export interface AttachmentData {
  id?: number;
  occurrenceId: number;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Attachment {
  id?: number;
  occurrenceId: number;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    id,
    occurrenceId,
    filePath,
    mimeType,
    sizeBytes,
    createdAt,
    updatedAt,
  }: AttachmentData) {
    this.id = id;
    this.occurrenceId = occurrenceId;
    this.filePath = filePath;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
