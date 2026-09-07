export interface CategoryData {
  id?: number;
  name: string;
  description?: string | null;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category {
  id?: number;
  name: string;
  description?: string | null;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    id,
    name,
    description,
    active,
    createdAt,
    updatedAt,
  }: CategoryData) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.active = active;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
