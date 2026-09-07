import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class UpdateRatingDTO {
  readonly score?: number;
  readonly comment?: string;

  private constructor(score?: number, comment?: string) {
    this.score = score;
    this.comment = comment;
  }

  static create(data: Record<string, unknown>): UpdateRatingDTO {
    const { score, comment } = data;
    if (
      score !== undefined &&
      (!Number.isInteger(score) ||
        (score as number) < 1 ||
        (score as number) > 5)
    ) {
      throw new ValidationError("Score must be an integer between 1 and 5");
    }
    if (comment !== undefined && typeof comment !== "string") {
      throw new ValidationError("Comment must be a string");
    }
    if (score === undefined && comment === undefined) {
      throw new ValidationError("At least one rating field must be provided");
    }
    return new UpdateRatingDTO(
      score as number | undefined,
      typeof comment === "string" ? comment.trim() : undefined
    );
  }
}
