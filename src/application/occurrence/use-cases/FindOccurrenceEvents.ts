import type { OccurrenceEvent } from "../../../domain/entities/OccurrenceEvent.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindOccurrenceEventsUseCase {
  constructor(
    private readonly occurrenceEventRepository: OccurrenceEventRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(occurrenceId: number, actor?: Actor): Promise<OccurrenceEvent[]> {
    const occurrence = await this.occurrenceRepository.findById(occurrenceId);
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", occurrenceId);

    if (actor && !OccurrencePolicy.canViewEvents(actor, occurrence)) {
      throw new UnauthorizedError(occurrenceId);
    }

    return this.occurrenceEventRepository.findByOccurrenceId(occurrenceId);
  }
}
