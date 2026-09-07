import type { OccurrenceEvent } from "../../../domain/entities/OccurrenceEvent.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";

export class FindAllOccurrenceEventUseCase {
  constructor(
    private readonly occurrenceEventRepository: OccurrenceEventRepository
  ) {}

  execute(): Promise<OccurrenceEvent[]> {
    return this.occurrenceEventRepository.findAll();
  }
}
