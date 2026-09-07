import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class UpdateCommentDTO {
  readonly body?: string;
  readonly isInternal?: boolean;

  private constructor(body?: string, isInternal?: boolean) {
    this.body = body;
    this.isInternal = isInternal;
  }

  static create(data: Record<string, unknown>): UpdateCommentDTO {
    const { body, isInternal } = data;
    if (
      body !== undefined &&
      (typeof body !== "string" || body.trim().length === 0)
    ) {
      throw new ValidationError("Body must be a non-empty string");
    }
    if (isInternal !== undefined && typeof isInternal !== "boolean") {
      throw new ValidationError("IsInternal must be a boolean");
    }
    if (body === undefined && isInternal === undefined) {
      throw new ValidationError("At least one comment field must be provided");
    }
    return new UpdateCommentDTO(
      typeof body === "string" ? body.trim() : undefined,
      isInternal as boolean | undefined
    );
  }
}
