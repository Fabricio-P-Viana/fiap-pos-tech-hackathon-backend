import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class CreateUserDTO {
  readonly name: string;
  readonly email: string;
  readonly password: string;

  private constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static create(data: Record<string, unknown>): CreateUserDTO {
    const { name, email, password } = data;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError(
        "Name is required and must be a non-empty string",
      );
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      throw new ValidationError(
        "Email is required and must be a non-empty string",
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new ValidationError(
        "Password is required and must be at least 6 characters",
      );
    }

    return new CreateUserDTO(name.trim(), email.trim(), password);
  }
}
