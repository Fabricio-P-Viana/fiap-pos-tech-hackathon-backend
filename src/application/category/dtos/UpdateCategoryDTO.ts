import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class UpdateCategoryDTO {
  readonly name?: string;
  readonly description?: string;
  readonly active?: boolean;

  private constructor(name?: string, description?: string, active?: boolean) {
    this.name = name;
    this.description = description;
    this.active = active;
  }

  static create(data: Record<string, unknown>): UpdateCategoryDTO {
    const { name, description, active } = data;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      throw new ValidationError("Name must be a non-empty string");
    }
    if (description !== undefined && typeof description !== "string") {
      throw new ValidationError("Description must be a string");
    }
    if (active !== undefined && typeof active !== "boolean") {
      throw new ValidationError("Active must be a boolean");
    }
    if (
      name === undefined &&
      description === undefined &&
      active === undefined
    ) {
      throw new ValidationError("At least one category field must be provided");
    }

    return new UpdateCategoryDTO(
      typeof name === "string" ? name.trim() : undefined,
      typeof description === "string" ? description.trim() : undefined,
      active as boolean | undefined
    );
  }
}
