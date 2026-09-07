import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class UpdateUserDTO {
  readonly name?: string;
  readonly email?: string;
  readonly password?: string;

  private constructor(name?: string, email?: string, password?: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static create(data: Record<string, unknown>): UpdateUserDTO {
    const { name, email, password } = data;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      throw new ValidationError("Name must be a non-empty string");
    }

    if (
      email !== undefined &&
      (typeof email !== "string" || email.trim().length === 0)
    ) {
      throw new ValidationError("Email must be a non-empty string");
    }

    if (
      password !== undefined &&
      (typeof password !== "string" || password.length < 6)
    ) {
      throw new ValidationError("Password must be at least 6 characters");
    }

    if (name === undefined && email === undefined && password === undefined) {
      throw new ValidationError(
        "At least one field (name, email or password) must be provided",
      );
    }

    return new UpdateUserDTO(
      name ? name.trim() : undefined,
      email ? email.trim() : undefined,
      password ? password : undefined,
    );
  }
}
