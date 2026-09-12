import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import { STATUS_TRANSITIONS } from "../../../domain/enums/occurrence-status.enum.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";
import type { ChangeOccurrenceStatusDTO } from "../dtos/ChangeOccurrenceStatusDTO.ts";

export class ChangeOccurrenceStatusUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository
  ) {}

  async execute(
    id: number,
    actor: Actor,
    dto: ChangeOccurrenceStatusDTO
  ): Promise<Occurrence> {
    if (!Number.isInteger(actor?.id) || actor.id <= 0)
      throw new ValidationError("ActorId must be a positive integer");

    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);

    const currentStatus = occurrence.status as OccurrenceStatus;
    if (!STATUS_TRANSITIONS[currentStatus].includes(dto.status)) {
      throw new ValidationError(
        `Cannot change status from ${currentStatus} to ${dto.status}`
      );
    }

    // O responsável precisa estar definido antes de qualquer movimentação e
    // somente ele conduz a ocorrência a partir daí.
    if (
      occurrence.assigneeId === null ||
      occurrence.assigneeId === undefined
    ) {
      throw new ValidationError(
        "An assignee must be defined before changing the occurrence status"
      );
    }
    if (!OccurrencePolicy.canChangeStatus(actor, occurrence)) {
      throw new UnauthorizedError(id);
    }

    if (dto.status === OccurrenceStatus.RESOLVED && !occurrence.resolution) {
      throw new ValidationError(
        "Resolution is required before resolving an occurrence"
      );
    }
    if (dto.status === OccurrenceStatus.CANCELLED && !dto.note) {
      throw new ValidationError(
        "A cancellation reason (note) is required to cancel an occurrence"
      );
    }

    const updated = await this.occurrenceRepository.update(id, {
      status: dto.status,
      ...(dto.status === OccurrenceStatus.RESOLVED && {
        resolvedAt: new Date(),
      }),
      ...(dto.status === OccurrenceStatus.CANCELLED && {
        cancellationReason: dto.note,
      }),
    });
    if (!updated) throw new ResourceNotFoundError("Occurrence", id);

    await this.occurrenceEventRepository.create({
      occurrenceId: id,
      type: OccurrenceEventType.STATUS_CHANGED,
      previousValue: currentStatus,
      newValue: dto.status,
      note: dto.note,
      actorId: actor.id,
    });

    return updated;
  }
}
