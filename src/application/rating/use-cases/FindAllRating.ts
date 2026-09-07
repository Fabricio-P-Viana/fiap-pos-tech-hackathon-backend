import type { Rating } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";

export class FindAllRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  execute(): Promise<Rating[]> {
    return this.ratingRepository.findAll();
  }
}
