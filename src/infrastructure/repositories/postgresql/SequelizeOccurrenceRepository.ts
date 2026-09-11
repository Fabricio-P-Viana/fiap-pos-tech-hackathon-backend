import { Op, type ModelStatic } from "sequelize";
import {
  Occurrence,
  type OccurrenceData,
} from "../../../domain/entities/Occurrence.ts";
import type {
  DashboardIndicators,
  OccurrenceFilter,
  OccurrenceRepository,
  PaginatedResult,
} from "../../../domain/repositories/OccurrenceRepository.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import type { OccurrenceModel } from "../../database/models/OccurrenceModel.ts";
import type { CategoryModel } from "../../database/models/CategoryModel.ts";

export default class SequelizeOccurrenceRepository
  implements OccurrenceRepository
{
  private occurrenceModel: ModelStatic<OccurrenceModel>;
  private categoryModel: ModelStatic<CategoryModel>;

  constructor(
    occurrenceModel: ModelStatic<OccurrenceModel>,
    categoryModel: ModelStatic<CategoryModel>
  ) {
    this.occurrenceModel = occurrenceModel;
    this.categoryModel = categoryModel;
  }

  private mapToDomain(occurrenceModel: OccurrenceModel): Occurrence {
    return new Occurrence(occurrenceModel.get({ plain: true }));
  }

  async create(occurrenceData: OccurrenceData): Promise<Occurrence> {
    const created = await this.occurrenceModel.create(occurrenceData);
    return this.mapToDomain(created);
  }

  private buildWhere(filter: OccurrenceFilter = {}) {
    const where: Record<string, unknown> = {};

    if (filter.requesterId !== undefined) where.requesterId = filter.requesterId;
    if (filter.assigneeId !== undefined) where.assigneeId = filter.assigneeId;
    if (filter.categoryId !== undefined) where.categoryId = filter.categoryId;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.priority !== undefined) where.priority = filter.priority;

    if (filter.search) {
      where[Op.or as unknown as string] = [
        { title: { [Op.iLike]: `%${filter.search}%` } },
        { description: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    if (filter.createdFrom || filter.createdTo) {
      where.createdAt = {
        ...(filter.createdFrom && { [Op.gte]: filter.createdFrom }),
        ...(filter.createdTo && { [Op.lte]: filter.createdTo }),
      };
    }

    if (filter.resolvedFrom || filter.resolvedTo) {
      where.resolvedAt = {
        ...(filter.resolvedFrom && { [Op.gte]: filter.resolvedFrom }),
        ...(filter.resolvedTo && { [Op.lte]: filter.resolvedTo }),
      };
    }

    return where;
  }

  async findAll(
    filter: OccurrenceFilter = {}
  ): Promise<PaginatedResult<Occurrence>> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 20;
    const where = this.buildWhere(filter);

    const { rows, count } = await this.occurrenceModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      data: rows.map((row) => this.mapToDomain(row)),
      page,
      limit,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    };
  }

  async findById(id: number): Promise<Occurrence | null> {
    const occurrence = await this.occurrenceModel.findByPk(id);
    return occurrence ? this.mapToDomain(occurrence) : null;
  }

  async update(
    id: number,
    occurrenceData: Partial<OccurrenceData>
  ): Promise<Occurrence | null> {
    const occurrence = await this.occurrenceModel.findByPk(id);
    if (!occurrence) return null;

    await occurrence.update(occurrenceData);
    return this.mapToDomain(occurrence);
  }

  async delete(id: number): Promise<boolean> {
    const occurrence = await this.occurrenceModel.findByPk(id);
    if (!occurrence) return false;

    await occurrence.destroy();
    return true;
  }

  async getDashboardIndicators(): Promise<DashboardIndicators> {
    const [total, statusRows, priorityRows, categoryRows, resolvedRows] =
      await Promise.all([
        this.occurrenceModel.count(),
        this.occurrenceModel.findAll({
          attributes: [
            "status",
            [this.occurrenceModel.sequelize!.fn("COUNT", "*"), "total"],
          ],
          group: ["status"],
          raw: true,
        }) as unknown as Promise<Array<{ status: string; total: string }>>,
        this.occurrenceModel.findAll({
          attributes: [
            "priority",
            [this.occurrenceModel.sequelize!.fn("COUNT", "*"), "total"],
          ],
          group: ["priority"],
          raw: true,
        }) as unknown as Promise<Array<{ priority: string; total: string }>>,
        this.occurrenceModel.findAll({
          attributes: [
            "categoryId",
            [this.occurrenceModel.sequelize!.fn("COUNT", "*"), "total"],
          ],
          group: ["categoryId"],
          raw: true,
        }) as unknown as Promise<
          Array<{ categoryId: number; total: string }>
        >,
        this.occurrenceModel.findAll({
          where: { resolvedAt: { [Op.ne]: null } },
          attributes: ["createdAt", "resolvedAt"],
          raw: true,
        }) as unknown as Promise<
          Array<{ createdAt: Date; resolvedAt: Date }>
        >,
      ]);

    const byStatus: Record<string, number> = {};
    for (const row of statusRows) byStatus[row.status] = Number(row.total);

    const byPriority: Record<string, number> = {};
    for (const row of priorityRows) byPriority[row.priority] = Number(row.total);

    const categoryIds = categoryRows.map((row) => row.categoryId);
    const categories = categoryIds.length
      ? await this.categoryModel.findAll({ where: { id: categoryIds } })
      : [];
    const categoryNameById = new Map(
      categories.map((category) => [category.id, category.name])
    );
    const byCategory = categoryRows.map((row) => ({
      categoryId: row.categoryId,
      categoryName: categoryNameById.get(row.categoryId) ?? "Unknown",
      total: Number(row.total),
    }));

    const averageResolutionHours = resolvedRows.length
      ? resolvedRows.reduce((acc, row) => {
          const diffMs =
            new Date(row.resolvedAt).getTime() -
            new Date(row.createdAt).getTime();
          return acc + diffMs / (1000 * 60 * 60);
        }, 0) / resolvedRows.length
      : null;

    return {
      total,
      byStatus,
      byPriority,
      byCategory,
      open: byStatus[OccurrenceStatus.OPEN] ?? 0,
      inProgress:
        (byStatus[OccurrenceStatus.IN_ANALYSIS] ?? 0) +
        (byStatus[OccurrenceStatus.IN_PROGRESS] ?? 0),
      resolved: byStatus[OccurrenceStatus.RESOLVED] ?? 0,
      averageResolutionHours:
        averageResolutionHours !== null
          ? Number(averageResolutionHours.toFixed(2))
          : null,
    };
  }
}
