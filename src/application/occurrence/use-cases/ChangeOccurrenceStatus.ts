import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import { STATUS_TRANSITIONS } from "../../../domain/enums/occurrence-status.enum.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { ChangeOccurrenceStatusDTO } from "../dtos/ChangeOccurrenceStatusDTO.ts";

export class ChangeOccurrenceStatusUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository
  ) {}

  async execute(
    id: number,
    actorId: number,
    dto: ChangeOccurrenceStatusDTO
  ): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);

    const currentStatus = occurrence.status as OccurrenceStatus;
    if (!STATUS_TRANSITIONS[currentStatus].includes(dto.status)) {
      throw new ValidationError(
        `Cannot change status from ${currentStatus} to ${dto.status}`
      );
    }
    if (!Number.isInteger(actorId) || actorId <= 0)
      throw new ValidationError("ActorId must be a positive integer");
    if (dto.status === OccurrenceStatus.RESOLVED && !occurrence.resolution) {
      throw new ValidationError(
        "Resolution is required before resolving an occurrence"
      );
    }

    const updated = await this.occurrenceRepository.update(id, {
      status: dto.status,
      ...(dto.status === OccurrenceStatus.RESOLVED && {
        resolvedAt: new Date(),
      }),
    });
    if (!updated) throw new ResourceNotFoundError("Occurrence", id);

    await this.occurrenceEventRepository.create({
      occurrenceId: id,
      type: OccurrenceEventType.STATUS_CHANGED,
      previousValue: currentStatus,
      newValue: dto.status,
      note: dto.note,
      actorId,
    });

    return updated;
  }
}
