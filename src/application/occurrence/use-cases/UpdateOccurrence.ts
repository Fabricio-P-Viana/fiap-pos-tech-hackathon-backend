import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { UpdateOccurrenceDTO } from "../dtos/UpdateOccurrenceDTO.ts";

export class UpdateOccurrenceUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository
  ) {}

  async execute(
    id: number,
    dto: UpdateOccurrenceDTO,
    actorId: number
  ): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);
    if (occurrence.status === "RESOLVED" || occurrence.status === "CANCELLED") {
      throw new ValidationError("Final occurrences cannot be edited");
    }

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category || category.active === false)
        throw new ValidationError("Category is not available");
    }

    const updated = await this.occurrenceRepository.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.locationText !== undefined && { locationText: dto.locationText }),
      ...(dto.locationReference !== undefined && {
        locationReference: dto.locationReference,
      }),
      ...(dto.latitude !== undefined && { latitude: dto.latitude }),
      ...(dto.longitude !== undefined && { longitude: dto.longitude }),
      ...(dto.resolution !== undefined && { resolution: dto.resolution }),
    });
    if (!updated) throw new ResourceNotFoundError("Occurrence", id);

    if (dto.priority !== undefined && dto.priority !== occurrence.priority) {
      await this.occurrenceEventRepository.create({
        occurrenceId: id,
        type: OccurrenceEventType.PRIORITY_CHANGED,
        previousValue: occurrence.priority,
        newValue: dto.priority,
        actorId,
      });
    }
    return updated;
  }
}
