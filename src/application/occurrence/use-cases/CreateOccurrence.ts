import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { CreateOccurrenceDTO } from "../dtos/CreateOccurrenceDTO.ts";

export class CreateOccurrenceUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(dto: CreateOccurrenceDTO): Promise<Occurrence> {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category || category.active === false)
      throw new ValidationError("Category is not available");

    const occurrence = await this.occurrenceRepository.create({
      requesterId: dto.requesterId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: OccurrenceStatus.OPEN,
      locationText: dto.locationText,
      locationReference: dto.locationReference,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    await this.occurrenceEventRepository.create({
      occurrenceId: occurrence.id as number,
      type: OccurrenceEventType.CREATED,
      actorId: dto.requesterId,
      newValue: OccurrenceStatus.OPEN,
    });

    return occurrence;
  }
}
