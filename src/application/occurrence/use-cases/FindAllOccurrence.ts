import type {
  OccurrenceFilter,
  OccurrenceRepository,
  PaginatedResult,
} from "../../../domain/repositories/OccurrenceRepository.ts";
import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindAllOccurrenceUseCase {
  constructor(private readonly occurrenceRepository: OccurrenceRepository) {}

  execute(
    filter: OccurrenceFilter,
    actor: Actor
  ): Promise<PaginatedResult<Occurrence>> {
    const scopedFilter: OccurrenceFilter = { ...filter };

    // Solicitante só pode ver as próprias ocorrências, independentemente do
    // que for informado na query string (evita bypass de escopo).
    if (!OccurrencePolicy.canListAll(actor)) {
      scopedFilter.requesterId = actor.id;
    }

    return this.occurrenceRepository.findAll(scopedFilter);
  }
}
