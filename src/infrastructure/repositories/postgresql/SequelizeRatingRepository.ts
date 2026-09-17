import { Op, type ModelStatic } from "sequelize";
import { Rating, type RatingData } from "../../../domain/entities/Rating.ts";
import type { DashboardPeriod } from "../../../domain/repositories/OccurrenceRepository.ts";
import type {
  RatingFilter,
  RatingIndicators,
  RatingRepository,
} from "../../../domain/repositories/RatingRepository.ts";
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

  async findAll(filter: RatingFilter = {}): Promise<Rating[]> {
    const where: Record<string, unknown> = {};
    if (filter.occurrenceId !== undefined)
      where.occurrenceId = filter.occurrenceId;
    if (filter.authorId !== undefined) where.authorId = filter.authorId;

    const ratings = await this.ratingModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    return ratings.map((rating) => this.mapToDomain(rating));
  }

  /**
   * Agrega as notas para o painel do gestor. A categoria vem por associação
   * (rating → ocorrência → categoria), evitando uma segunda consulta.
   */
  async getIndicators(period: DashboardPeriod): Promise<RatingIndicators> {
    const ratings = await this.ratingModel.findAll({
      attributes: ["score"],
      include: [
        {
          association: "occurrence",
          attributes: ["id", "categoryId"],
          required: true,
          where: { createdAt: { [Op.between]: [period.from, period.to] } },
          include: [
            { association: "category", attributes: ["id", "name"], required: false },
          ],
        },
      ],
    });

    const distribution: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };
    const byCategoryAccumulator = new Map<
      number,
      { categoryName: string; count: number; total: number }
    >();
    let total = 0;

    for (const rating of ratings) {
      const plain = rating.get({ plain: true }) as {
        score: number;
        occurrence?: {
          categoryId?: number;
          category?: { name?: string } | null;
        } | null;
      };
      const score = Number(plain.score);
      total += score;
      const bucket = String(Math.round(score));
      if (bucket in distribution) distribution[bucket] += 1;

      const categoryId = plain.occurrence?.categoryId;
      if (categoryId === undefined || categoryId === null) continue;
      const current = byCategoryAccumulator.get(categoryId) ?? {
        categoryName: plain.occurrence?.category?.name ?? "Unknown",
        count: 0,
        total: 0,
      };
      current.count += 1;
      current.total += score;
      byCategoryAccumulator.set(categoryId, current);
    }

    const round = (value: number): number => Number(value.toFixed(2));

    return {
      count: ratings.length,
      average: ratings.length ? round(total / ratings.length) : null,
      distribution,
      byCategory: [...byCategoryAccumulator.entries()]
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.categoryName,
          count: data.count,
          average: round(data.total / data.count),
        }))
        .sort((a, b) => b.average - a.average),
    };
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
