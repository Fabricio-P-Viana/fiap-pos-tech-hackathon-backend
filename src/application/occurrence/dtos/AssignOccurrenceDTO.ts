import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class AssignOccurrenceDTO {
  readonly assigneeId: number | null;
  readonly note?: string;

  private constructor(assigneeId: number | null, note?: string) {
    this.assigneeId = assigneeId;
    this.note = note;
  }

  static create(data: Record<string, unknown>): AssignOccurrenceDTO {
    const { assigneeId, note } = data;
    if (assigneeId !== null && (!Number.isInteger(assigneeId) || (assigneeId as number) <= 0)) {
      throw new ValidationError("AssigneeId must be a positive integer or null");
    }
    if (note !== undefined && (typeof note !== "string" || note.trim().length === 0)) {
      throw new ValidationError("Note must be a non-empty string");
    }
    return new AssignOccurrenceDTO(
      assigneeId as number | null,
      typeof note === "string" ? note.trim() : undefined,
    );
  }
}
