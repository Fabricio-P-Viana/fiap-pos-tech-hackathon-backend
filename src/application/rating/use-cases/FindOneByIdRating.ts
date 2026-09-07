import type { Rating } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class FindOneByIdRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  async execute(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) throw new ResourceNotFoundError("Rating", id);
    return rating;
  }
}
