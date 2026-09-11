import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { isFinalStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class CancelOccurrenceUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository
  ) {}

  async execute(id: number, actor: Actor, note?: string): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);

    if (isFinalStatus(occurrence.status as OccurrenceStatus)) {
      throw new ValidationError(
        "Occurrences in a final status cannot be cancelled"
      );
    }

    if (!OccurrencePolicy.canCancel(actor, occurrence)) {
      throw new UnauthorizedError(id);
    }

    const previousStatus = occurrence.status;
    const updated = await this.occurrenceRepository.update(id, {
      status: OccurrenceStatus.CANCELLED,
    });
    if (!updated) throw new ResourceNotFoundError("Occurrence", id);

    await this.occurrenceEventRepository.create({
      occurrenceId: id,
      type: OccurrenceEventType.STATUS_CHANGED,
      previousValue: previousStatus,
      newValue: OccurrenceStatus.CANCELLED,
      note,
      actorId: actor.id,
    });

    return updated;
  }
}
