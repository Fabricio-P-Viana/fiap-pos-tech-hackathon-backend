import type { Rating } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import type { UpdateRatingDTO } from "../dtos/UpdateRatingDTO.ts";

export class UpdateRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}
  async execute(
    id: number,
    dto: UpdateRatingDTO,
    actor?: Actor
  ): Promise<Rating> {
    const existing = await this.ratingRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError("Rating", id);

    // Só o autor revisa a própria avaliação: gestor não reescreve a nota
    // que recebeu.
    if (actor && existing.authorId !== actor.id) {
      throw new UnauthorizedError(id);
    }

    const updated = await this.ratingRepository.update(id, {
      ...(dto.score !== undefined && { score: dto.score }),
      ...(dto.comment !== undefined && { comment: dto.comment }),
    });
    if (!updated) throw new ResourceNotFoundError("Rating", id);
    return updated;
  }
}
