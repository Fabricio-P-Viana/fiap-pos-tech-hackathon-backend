import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) throw new ResourceNotFoundError("Category", id);
  }
}
