import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class CreateCommentDTO {
  readonly occurrenceId: number;
  readonly authorId: number;
  readonly body: string;
  readonly isInternal: boolean;

  private constructor(
    occurrenceId: number,
    authorId: number,
    body: string,
    isInternal: boolean
  ) {
    this.occurrenceId = occurrenceId;
    this.authorId = authorId;
    this.body = body;
    this.isInternal = isInternal;
  }

  static create(data: Record<string, unknown>): CreateCommentDTO {
    const { occurrenceId, authorId, body, isInternal = false } = data;
    if (!Number.isInteger(occurrenceId) || (occurrenceId as number) <= 0)
      throw new ValidationError("OccurrenceId must be a positive integer");
    if (!Number.isInteger(authorId) || (authorId as number) <= 0)
      throw new ValidationError("AuthorId must be a positive integer");
    if (typeof body !== "string" || body.trim().length === 0)
      throw new ValidationError(
        "Body is required and must be a non-empty string"
      );
    if (typeof isInternal !== "boolean")
      throw new ValidationError("IsInternal must be a boolean");
    return new CreateCommentDTO(
      occurrenceId as number,
      authorId as number,
      body.trim(),
      isInternal
    );
  }
}
