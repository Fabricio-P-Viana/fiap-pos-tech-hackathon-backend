import type { Rating } from "../../../domain/entities/Rating.ts";
import type {
  RatingFilter,
  RatingRepository,
} from "../../../domain/repositories/RatingRepository.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindAllRatingUseCase {
  constructor(private readonly ratingRepository: RatingRepository) {}

  /**
   * O gestor acompanha todas as notas; o solicitante só vê as que escreveu.
   * Sem ator informado o comportamento antigo (sem escopo) é preservado para
   * chamadas internas.
   */
  execute(filter: RatingFilter = {}, actor?: Actor): Promise<Rating[]> {
    const scopedFilter: RatingFilter = { ...filter };
    if (actor && !OccurrencePolicy.isManager(actor)) {
      scopedFilter.authorId = actor.id;
    }
    return this.ratingRepository.findAll(scopedFilter);
  }
}
