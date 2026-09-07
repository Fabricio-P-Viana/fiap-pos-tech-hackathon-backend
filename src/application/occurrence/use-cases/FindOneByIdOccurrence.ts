import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class FindOneByIdOccurrenceUseCase {
  constructor(private readonly occurrenceRepository: OccurrenceRepository) {}

  async execute(id: number): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);
    return occurrence;
  }
}
