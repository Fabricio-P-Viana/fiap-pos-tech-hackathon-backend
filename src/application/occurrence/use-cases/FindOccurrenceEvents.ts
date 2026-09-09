import type { OccurrenceEvent } from "../../../domain/entities/OccurrenceEvent.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";

export class FindOccurrenceEventsUseCase {
  constructor(
    private readonly occurrenceEventRepository: OccurrenceEventRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(occurrenceId: number): Promise<OccurrenceEvent[]> {
    const occurrence = await this.occurrenceRepository.findById(occurrenceId);
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", occurrenceId);
    return this.occurrenceEventRepository.findByOccurrenceId(occurrenceId);
  }
}
