import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";

export class ChangeOccurrenceStatusDTO {
  readonly status: OccurrenceStatus;
  readonly note?: string;

  private constructor(status: OccurrenceStatus, note?: string) {
    this.status = status;
    this.note = note;
  }

  static create(data: Record<string, unknown>): ChangeOccurrenceStatusDTO {
    const { status, note } = data;
    if (!Object.values(OccurrenceStatus).includes(status as OccurrenceStatus)) {
      throw new ValidationError("Status is invalid");
    }
    if (
      note !== undefined &&
      (typeof note !== "string" || note.trim().length === 0)
    ) {
      throw new ValidationError("Note must be a non-empty string");
    }
    return new ChangeOccurrenceStatusDTO(
      status as OccurrenceStatus,
      typeof note === "string" ? note.trim() : undefined
    );
  }
}
