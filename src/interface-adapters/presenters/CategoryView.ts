import { Category } from "../../domain/entities/Category.ts";

export default class CategoryView {
  static render(category: Category): Category {
    return category;
  }

  static renderMany(categories: Category[]): Category[] {
    return categories.map((category) => this.render(category));
  }
}
