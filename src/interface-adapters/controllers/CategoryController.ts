import type { ReqResNextFunction } from "../types/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { CreateCategoryDTO } from "../../application/category/dtos/CreateCategoryDTO.ts";
import { UpdateCategoryDTO } from "../../application/category/dtos/UpdateCategoryDTO.ts";
import type { CreateCategoryUseCase } from "../../application/category/use-cases/CreateCategory.ts";
import type { UpdateCategoryUseCase } from "../../application/category/use-cases/UpdateCategory.ts";
import type { DeleteCategoryUseCase } from "../../application/category/use-cases/DeleteCategory.ts";
import type { FindAllCategoryUseCase } from "../../application/category/use-cases/FindAllCategory.ts";
import type { FindOneByIdCategoryUseCase } from "../../application/category/use-cases/FindOneByIdCategory.ts";
import CategoryView from "../presenters/CategoryView.ts";

export default class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findAllCategoryUseCase: FindAllCategoryUseCase,
    private readonly findOneByIdCategoryUseCase: FindOneByIdCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  private parseId(id: string | string[]): number {
    const value = parseInt(Array.isArray(id) ? id[0] : id, 10);
    if (Number.isNaN(value))
      throw new ValidationError("Category ID must be a valid number");
    return value;
  }

  async create({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const category = await this.createCategoryUseCase.execute(
        CreateCategoryDTO.create(req.body)
      );
      res.status(201).json(CategoryView.render(category));
    } catch (error) {
      next(error);
    }
  }

  async findAll({ res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          CategoryView.renderMany(await this.findAllCategoryUseCase.execute())
        );
    } catch (error) {
      next(error);
    }
  }

  async findById({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          CategoryView.render(
            await this.findOneByIdCategoryUseCase.execute(
              this.parseId(req.params.id)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async update({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const category = await this.updateCategoryUseCase.execute(
        this.parseId(req.params.id),
        UpdateCategoryDTO.create(req.body)
      );
      res.status(200).json(CategoryView.render(category));
    } catch (error) {
      next(error);
    }
  }

  async delete({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      await this.deleteCategoryUseCase.execute(this.parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
