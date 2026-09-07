export class UserNotFoundError extends Error {
  constructor(userId: number | string) {
    super(`User with id/email = ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}
