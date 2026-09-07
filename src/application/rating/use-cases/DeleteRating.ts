import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class DeleteRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  async execute(id: number): Promise<void> {
    if (!(await this.ratingRepository.delete(id)))
      throw new ResourceNotFoundError("Rating", id);
  }
}
