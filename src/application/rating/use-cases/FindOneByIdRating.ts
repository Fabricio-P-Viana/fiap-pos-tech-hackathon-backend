import type { Rating } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindOneByIdRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  async execute(id: number, actor?: Actor): Promise<Rating> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) throw new ResourceNotFoundError("Rating", id);

    // Avaliação é do solicitante que a escreveu; gestores acompanham todas.
    if (
      actor &&
      !OccurrencePolicy.isManager(actor) &&
      rating.authorId !== actor.id
    ) {
      throw new UnauthorizedError(id);
    }
    return rating;
  }
}
