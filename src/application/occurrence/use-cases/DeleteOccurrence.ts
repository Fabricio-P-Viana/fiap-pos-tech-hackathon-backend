import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class DeleteOccurrenceUseCase {
  constructor(private readonly occurrenceRepository: OccurrenceRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.occurrenceRepository.delete(id);
    if (!deleted) throw new ResourceNotFoundError("Occurrence", id);
  }
}
