export class InvalidCredentialsError extends Error {
  constructor() {
    super(`Invalid credentials for user`);
    this.name = "InvalidCredentialsError";
  }
}
