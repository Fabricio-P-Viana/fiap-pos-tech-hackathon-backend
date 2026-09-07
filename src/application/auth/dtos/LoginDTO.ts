import { ValidationError } from "../../../domain/errors/ValidationError.ts";

export class LoginDTO {
  readonly email: string;
  readonly password: string;

  private constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static create(data: Record<string, unknown>): LoginDTO {
    const { email, password } = data;

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

    return new LoginDTO(email.trim(), password);
  }
}
