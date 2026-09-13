import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindOneByIdOccurrenceUseCase {
  constructor(private readonly occurrenceRepository: OccurrenceRepository) {}

  async execute(id: number, actor?: Actor): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);

    if (actor && !OccurrencePolicy.canView(actor, occurrence)) {
      throw new UnauthorizedError(id);
    }

    return occurrence;
  }
}
