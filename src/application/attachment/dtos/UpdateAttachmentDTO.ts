import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class UpdateAttachmentDTO {
  readonly filePath?: string;
  readonly mimeType?: string;
  readonly sizeBytes?: number;

  private constructor(
    filePath?: string,
    mimeType?: string,
    sizeBytes?: number
  ) {
    this.filePath = filePath;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
  }

  static create(data: Record<string, unknown>): UpdateAttachmentDTO {
    const { filePath, mimeType, sizeBytes } = data;
    for (const [field, value] of Object.entries({ filePath, mimeType })) {
      if (
        value !== undefined &&
        (typeof value !== "string" || value.trim().length === 0)
      ) {
        throw new ValidationError(`${field} must be a non-empty string`);
      }
    }
    if (
      sizeBytes !== undefined &&
      (!Number.isInteger(sizeBytes) || (sizeBytes as number) <= 0)
    ) {
      throw new ValidationError("SizeBytes must be a positive integer");
    }
    if (
      filePath === undefined &&
      mimeType === undefined &&
      sizeBytes === undefined
    ) {
      throw new ValidationError(
        "At least one attachment field must be provided"
      );
    }
    return new UpdateAttachmentDTO(
      typeof filePath === "string" ? filePath.trim() : undefined,
      typeof mimeType === "string" ? mimeType.trim() : undefined,
      sizeBytes as number | undefined
    );
  }
}
