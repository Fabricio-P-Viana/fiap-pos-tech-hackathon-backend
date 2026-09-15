import type { Occurrence } from "../../../domain/entities/Occurrence.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export function ensureAttachmentWriteAccess(
  occurrence: Occurrence,
  actor: Actor
): void {
  if (!OccurrencePolicy.isOwner(actor, occurrence)) {
    throw new UnauthorizedError(occurrence.id as number);
  }
  if (OccurrencePolicy.isFinal(occurrence)) {
    throw new ValidationError(
      "Occurrences in a final status no longer accept attachment changes"
    );
  }
}
