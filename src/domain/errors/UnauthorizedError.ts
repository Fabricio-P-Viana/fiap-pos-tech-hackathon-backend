export class UnauthorizedError extends Error {
  constructor(id: number) {
    super(`You don't authorized for edit/delete/update this: ${id}`);
    this.name = "UnauthorizedError";
  }
}
