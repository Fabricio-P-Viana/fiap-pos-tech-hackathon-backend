import type { Category } from "../../../domain/entities/Category.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";

export class FindAllCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
