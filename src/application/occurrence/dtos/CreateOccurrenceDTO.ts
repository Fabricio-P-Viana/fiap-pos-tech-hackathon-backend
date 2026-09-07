import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { Priority } from "../../../domain/enums/priority.enum.ts";

export class CreateOccurrenceDTO {
  readonly requesterId: number;
  readonly categoryId: number;
  readonly title: string;
  readonly description: string;
  readonly priority: Priority;
  readonly locationText?: string;
  readonly locationReference?: string;
  readonly latitude?: number;
  readonly longitude?: number;

  private constructor(
    requesterId: number,
    categoryId: number,
    title: string,
    description: string,
    priority: Priority,
    locationText?: string,
    locationReference?: string,
    latitude?: number,
    longitude?: number
  ) {
    this.requesterId = requesterId;
    this.categoryId = categoryId;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.locationText = locationText;
    this.locationReference = locationReference;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static create(data: Record<string, unknown>): CreateOccurrenceDTO {
    const {
      requesterId,
      categoryId,
      title,
      description,
      priority,
      locationText,
      locationReference,
      latitude,
      longitude,
    } = data;

    if (!Number.isInteger(requesterId) || (requesterId as number) <= 0) {
      throw new ValidationError("RequesterId must be a positive integer");
    }
    if (!Number.isInteger(categoryId) || (categoryId as number) <= 0) {
      throw new ValidationError("CategoryId must be a positive integer");
    }
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new ValidationError(
        "Title is required and must be a non-empty string"
      );
    }
    if (typeof description !== "string" || description.trim().length === 0) {
      throw new ValidationError(
        "Description is required and must be a non-empty string"
      );
    }
    if (!Object.values(Priority).includes(priority as Priority)) {
      throw new ValidationError("Priority is invalid");
    }
    if (locationText !== undefined && typeof locationText !== "string") {
      throw new ValidationError("LocationText must be a string");
    }
    if (
      locationReference !== undefined &&
      typeof locationReference !== "string"
    ) {
      throw new ValidationError("LocationReference must be a string");
    }
    if (
      latitude !== undefined &&
      (typeof latitude !== "number" || latitude < -90 || latitude > 90)
    ) {
      throw new ValidationError("Latitude must be between -90 and 90");
    }
    if (
      longitude !== undefined &&
      (typeof longitude !== "number" || longitude < -180 || longitude > 180)
    ) {
      throw new ValidationError("Longitude must be between -180 and 180");
    }

    return new CreateOccurrenceDTO(
      requesterId as number,
      categoryId as number,
      title.trim(),
      description.trim(),
      priority as Priority,
      typeof locationText === "string" ? locationText.trim() : undefined,
      typeof locationReference === "string"
        ? locationReference.trim()
        : undefined,
      latitude as number | undefined,
      longitude as number | undefined
    );
  }
}
