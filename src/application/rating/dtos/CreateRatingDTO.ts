import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class CreateRatingDTO {
  readonly occurrenceId: number;
  readonly authorId: number;
  readonly score: number;
  readonly comment?: string;

  private constructor(
    occurrenceId: number,
    authorId: number,
    score: number,
    comment?: string
  ) {
    this.occurrenceId = occurrenceId;
    this.authorId = authorId;
    this.score = score;
    this.comment = comment;
  }

  static create(data: Record<string, unknown>): CreateRatingDTO {
    const { occurrenceId, authorId, score, comment } = data;
    if (!Number.isInteger(occurrenceId) || (occurrenceId as number) <= 0)
      throw new ValidationError("OccurrenceId must be a positive integer");
    if (!Number.isInteger(authorId) || (authorId as number) <= 0)
      throw new ValidationError("AuthorId must be a positive integer");
    if (
      !Number.isInteger(score) ||
      (score as number) < 1 ||
      (score as number) > 5
    )
      throw new ValidationError("Score must be an integer between 1 and 5");
    if (comment !== undefined && typeof comment !== "string")
      throw new ValidationError("Comment must be a string");
    return new CreateRatingDTO(
      occurrenceId as number,
      authorId as number,
      score as number,
      typeof comment === "string" ? comment.trim() : undefined
    );
  }
}
