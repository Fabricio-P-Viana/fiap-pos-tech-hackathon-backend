import type { Category } from "../../../domain/entities/Category.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import type { CreateCategoryDTO } from "../dtos/CreateCategoryDTO.ts";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(dto: CreateCategoryDTO): Promise<Category> {
    return this.categoryRepository.create({
      name: dto.name,
      description: dto.description,
      active: true,
    });
  }
}
