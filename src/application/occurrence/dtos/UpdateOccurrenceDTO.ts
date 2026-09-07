import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { Priority } from "../../../domain/enums/priority.enum.ts";

export class UpdateOccurrenceDTO {
  readonly title?: string;
  readonly description?: string;
  readonly categoryId?: number;
  readonly priority?: Priority;
  readonly locationText?: string;
  readonly locationReference?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly resolution?: string;

  private constructor(data: Partial<UpdateOccurrenceDTO>) {
    Object.assign(this, data);
  }

  static create(data: Record<string, unknown>): UpdateOccurrenceDTO {
    const {
      title,
      description,
      categoryId,
      priority,
      locationText,
      locationReference,
      latitude,
      longitude,
      resolution,
    } = data;
    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length === 0)
    )
      throw new ValidationError("Title must be a non-empty string");
    if (
      description !== undefined &&
      (typeof description !== "string" || description.trim().length === 0)
    )
      throw new ValidationError("Description must be a non-empty string");
    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || (categoryId as number) <= 0)
    )
      throw new ValidationError("CategoryId must be a positive integer");
    if (
      priority !== undefined &&
      !Object.values(Priority).includes(priority as Priority)
    )
      throw new ValidationError("Priority is invalid");
    if (
      latitude !== undefined &&
      (typeof latitude !== "number" || latitude < -90 || latitude > 90)
    )
      throw new ValidationError("Latitude must be between -90 and 90");
    if (
      longitude !== undefined &&
      (typeof longitude !== "number" || longitude < -180 || longitude > 180)
    )
      throw new ValidationError("Longitude must be between -180 and 180");
    for (const [field, value] of Object.entries({
      locationText,
      locationReference,
      resolution,
    })) {
      if (value !== undefined && typeof value !== "string")
        throw new ValidationError(`${field} must be a string`);
    }
    if (Object.values(data).every((value) => value === undefined))
      throw new ValidationError(
        "At least one occurrence field must be provided"
      );

    return new UpdateOccurrenceDTO({
      title: typeof title === "string" ? title.trim() : undefined,
      description:
        typeof description === "string" ? description.trim() : undefined,
      categoryId: categoryId as number | undefined,
      priority: priority as Priority | undefined,
      locationText:
        typeof locationText === "string" ? locationText.trim() : undefined,
      locationReference:
        typeof locationReference === "string"
          ? locationReference.trim()
          : undefined,
      latitude: latitude as number | undefined,
      longitude: longitude as number | undefined,
      resolution:
        typeof resolution === "string" ? resolution.trim() : undefined,
    });
  }
}
