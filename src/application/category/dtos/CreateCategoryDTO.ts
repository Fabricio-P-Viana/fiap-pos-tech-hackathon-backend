import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class CreateCategoryDTO {
  readonly name: string;
  readonly description?: string;

  private constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }

  static create(data: Record<string, unknown>): CreateCategoryDTO {
    const { name, description } = data;

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError(
        "Name is required and must be a non-empty string"
      );
    }

    if (description !== undefined && typeof description !== "string") {
      throw new ValidationError("Description must be a string");
    }

    return new CreateCategoryDTO(
      name.trim(),
      typeof description === "string" ? description.trim() : undefined
    );
  }
}
