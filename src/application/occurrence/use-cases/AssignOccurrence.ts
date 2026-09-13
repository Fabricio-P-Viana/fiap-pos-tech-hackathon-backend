import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import { UserRole } from "../../../domain/entities/User.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { UserRepository } from "../../../domain/repositories/UserRepository.ts";
import type { AssignOccurrenceDTO } from "../dtos/AssignOccurrenceDTO.ts";

export class AssignOccurrenceUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly occurrenceEventRepository: OccurrenceEventRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    id: number,
    actor: Actor,
    dto: AssignOccurrenceDTO
  ): Promise<Occurrence> {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) throw new ResourceNotFoundError("Occurrence", id);
    if (["RESOLVED", "CANCELLED"].includes(occurrence.status)) {
      throw new ValidationError("Final occurrences cannot be assigned");
    }
    if (!OccurrencePolicy.canAssign(actor, occurrence)) {
      throw new UnauthorizedError(id);
    }

    if (dto.assigneeId !== null) {
      const assignee = await this.userRepository.findById(dto.assigneeId);
      if (!assignee) throw new ResourceNotFoundError("User", dto.assigneeId);
      if (assignee.role !== UserRole.MANAGER) {
        throw new ValidationError("Assignee must be a manager");
      }
    }

    const updated = await this.occurrenceRepository.update(id, {
      assigneeId: dto.assigneeId,
    });
    if (!updated) throw new ResourceNotFoundError("Occurrence", id);

    await this.occurrenceEventRepository.create({
      occurrenceId: id,
      type: OccurrenceEventType.ASSIGNEE_CHANGED,
      previousValue: occurrence.assigneeId?.toString() ?? null,
      newValue: dto.assigneeId?.toString() ?? null,
      note: dto.note,
      actorId: actor.id,
    });
    return updated;
  }
}
