import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class CreateAttachmentDTO {
  readonly occurrenceId: number;
  readonly filePath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;

  private constructor(
    occurrenceId: number,
    filePath: string,
    mimeType: string,
    sizeBytes: number
  ) {
    this.occurrenceId = occurrenceId;
    this.filePath = filePath;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
  }

  static create(data: Record<string, unknown>): CreateAttachmentDTO {
    const { occurrenceId, filePath, mimeType, sizeBytes } = data;
    if (!Number.isInteger(occurrenceId) || (occurrenceId as number) <= 0)
      throw new ValidationError("OccurrenceId must be a positive integer");
    if (typeof filePath !== "string" || filePath.trim().length === 0)
      throw new ValidationError(
        "FilePath is required and must be a non-empty string"
      );
    if (typeof mimeType !== "string" || mimeType.trim().length === 0)
      throw new ValidationError(
        "MimeType is required and must be a non-empty string"
      );
    if (!Number.isInteger(sizeBytes) || (sizeBytes as number) <= 0)
      throw new ValidationError("SizeBytes must be a positive integer");
    return new CreateAttachmentDTO(
      occurrenceId as number,
      filePath.trim(),
      mimeType.trim(),
      sizeBytes as number
    );
  }
}
