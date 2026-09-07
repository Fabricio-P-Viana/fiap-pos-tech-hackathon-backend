import type { Rating } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { UpdateRatingDTO } from "../dtos/UpdateRatingDTO.ts";

export class UpdateRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  async execute(id: number, dto: UpdateRatingDTO): Promise<Rating> {
    const updated = await this.ratingRepository.update(id, {
      ...(dto.score !== undefined && { score: dto.score }),
      ...(dto.comment !== undefined && { comment: dto.comment }),
    });
    if (!updated) throw new ResourceNotFoundError("Rating", id);
    return updated;
  }
}
