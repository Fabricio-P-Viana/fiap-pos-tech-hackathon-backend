import type { Category } from "../../../domain/entities/Category.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class FindOneByIdCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new ResourceNotFoundError("Category", id);
    return category;
  }
}
