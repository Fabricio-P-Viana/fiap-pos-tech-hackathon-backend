import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import { OccurrenceStatus, isFinalStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { UpdateOccurrenceDTO } from "../dtos/UpdateOccurrenceDTO.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

const REQUESTER_ONLY_ALLOWED_FIELDS = [
  "title",
  "description",
  "categoryId",
  "locationText",
  "locationReference",
  "latitude",
  "longitude",
] as const;

export class UpdateOccurrenceUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository
  ) {}

  async execute(
    id: number,
    dto: UpdateOccurrenceDTO,
    actor: Actor
  ): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);

    if (!OccurrencePolicy.canEditContent(actor, occurrence)) {
      if (isFinalStatus(occurrence.status as OccurrenceStatus)) {
        throw new ValidationError("Final occurrences cannot be edited");
      }
      if (
        OccurrencePolicy.isManager(actor) &&
        (occurrence.assigneeId === null || occurrence.assigneeId === undefined)
      ) {
        throw new ValidationError(
          "An assignee must be defined before managing the occurrence"
        );
      }
      throw new UnauthorizedError(id);
    }

    // Solicitante só pode alterar título, descrição, categoria e
    // localização; prioridade e resolução são exclusivas do gestor.
    if (!OccurrencePolicy.isManager(actor)) {
      const forbiddenField = Object.keys(dto).find(
        (key) =>
          (dto as Record<string, unknown>)[key] !== undefined &&
          !REQUESTER_ONLY_ALLOWED_FIELDS.includes(
            key as (typeof REQUESTER_ONLY_ALLOWED_FIELDS)[number]
          )
      );
      if (forbiddenField) {
        throw new UnauthorizedError(id);
      }
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
        actorId: actor.id,
      });
    }
    return updated;
  }
}
