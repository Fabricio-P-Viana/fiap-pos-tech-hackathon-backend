import type { Rating } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { CreateRatingDTO } from "../dtos/CreateRatingDTO.ts";

export class CreateRatingUseCase {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(dto: CreateRatingDTO): Promise<Rating> {
    const occurrence = await this.occurrenceRepository.findById(
      dto.occurrenceId
    );
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", dto.occurrenceId);
    if (occurrence.status !== "RESOLVED")
      throw new ValidationError("Only resolved occurrences can be rated");
    return this.ratingRepository.create(dto);
  }
}
