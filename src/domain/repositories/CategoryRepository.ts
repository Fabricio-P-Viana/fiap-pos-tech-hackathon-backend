import { Category, CategoryData } from "../entities/Category.ts";

export interface CategoryRepository {
  create(_categoryData: CategoryData): Promise<Category>;
  findAll(): Promise<Category[]>;
  findById(_id: number): Promise<Category | null>;
  update(
    _id: number,
    _categoryData: Partial<CategoryData>
  ): Promise<Category | null>;
  delete(_id: number): Promise<boolean>;
}
