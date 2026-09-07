import type { ModelStatic } from "sequelize";
import {
  Category,
  type CategoryData,
} from "../../../domain/entities/Category.ts";
import type { CategoryRepository } from "../../../domain/repositories/CategoryRepository.ts";
import type { CategoryModel } from "../../database/models/CategoryModel.ts";

export default class SequelizeCategoryRepository implements CategoryRepository {
  private categoryModel: ModelStatic<CategoryModel>;

  constructor(categoryModel: ModelStatic<CategoryModel>) {
    this.categoryModel = categoryModel;
  }

  private mapToDomain(categoryModel: CategoryModel): Category {
    return new Category(categoryModel.get({ plain: true }));
  }

  async create(categoryData: CategoryData): Promise<Category> {
    const created = await this.categoryModel.create(categoryData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryModel.findAll();
    return categories.map((category) => this.mapToDomain(category));
  }

  async findById(id: number): Promise<Category | null> {
    const category = await this.categoryModel.findByPk(id);
    return category ? this.mapToDomain(category) : null;
  }

  async update(
    id: number,
    categoryData: Partial<CategoryData>
  ): Promise<Category | null> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) return null;

    await category.update(categoryData);
    return this.mapToDomain(category);
  }

  async delete(id: number): Promise<boolean> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) return false;

    await category.destroy();
    return true;
  }
}
