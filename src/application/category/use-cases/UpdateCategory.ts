import type { Category } from "../../../domain/entities/Category.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { UpdateCategoryDTO } from "../dtos/UpdateCategoryDTO.ts";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: number, dto: UpdateCategoryDTO): Promise<Category> {
    const updated = await this.categoryRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.active !== undefined && { active: dto.active }),
    });
    if (!updated) throw new ResourceNotFoundError("Category", id);
    return updated;
  }
}
