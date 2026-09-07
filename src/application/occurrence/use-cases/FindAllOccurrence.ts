import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";

export class FindAllOccurrenceUseCase {
  constructor(private readonly occurrenceRepository: OccurrenceRepository) {}

  execute(): Promise<Occurrence[]> {
    return this.occurrenceRepository.findAll();
  }
}
