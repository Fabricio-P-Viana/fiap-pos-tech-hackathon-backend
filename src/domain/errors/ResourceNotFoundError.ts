export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: number | string) {
    super(`${resource} with id = ${id} not found`);
    this.name = "ResourceNotFoundError";
  }
}
