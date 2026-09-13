import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class DeleteRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  async execute(id: number, actor?: Actor): Promise<void> {
    const existing = await this.ratingRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError("Rating", id);

    if (
      actor &&
      !OccurrencePolicy.isManager(actor) &&
      existing.authorId !== actor.id
    ) {
      throw new UnauthorizedError(id);
    }

    if (!(await this.ratingRepository.delete(id)))
      throw new ResourceNotFoundError("Rating", id);
  }
}
