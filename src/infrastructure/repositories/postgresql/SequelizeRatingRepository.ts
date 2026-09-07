import type { ModelStatic } from "sequelize";
import { Rating, type RatingData } from "../../../domain/entities/Rating.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";
import type { RatingModel } from "../../database/models/RatingModel.ts";

export default class SequelizeRatingRepository implements RatingRepository {
  private ratingModel: ModelStatic<RatingModel>;

  constructor(ratingModel: ModelStatic<RatingModel>) {
    this.ratingModel = ratingModel;
  }

  private mapToDomain(ratingModel: RatingModel): Rating {
    return new Rating(ratingModel.get({ plain: true }));
  }

  async create(ratingData: RatingData): Promise<Rating> {
    const created = await this.ratingModel.create(ratingData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<Rating[]> {
    const ratings = await this.ratingModel.findAll();
    return ratings.map((rating) => this.mapToDomain(rating));
  }

  async findById(id: number): Promise<Rating | null> {
    const rating = await this.ratingModel.findByPk(id);
    return rating ? this.mapToDomain(rating) : null;
  }

  async update(
    id: number,
    ratingData: Partial<RatingData>
  ): Promise<Rating | null> {
    const rating = await this.ratingModel.findByPk(id);
    if (!rating) return null;

    await rating.update(ratingData);
    return this.mapToDomain(rating);
  }

  async delete(id: number): Promise<boolean> {
    const rating = await this.ratingModel.findByPk(id);
    if (!rating) return false;

    await rating.destroy();
    return true;
  }
}
