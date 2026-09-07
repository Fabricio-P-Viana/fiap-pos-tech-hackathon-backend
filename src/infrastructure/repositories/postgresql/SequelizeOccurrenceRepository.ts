import type { ModelStatic } from "sequelize";
import {
  Occurrence,
  type OccurrenceData,
} from "../../../domain/entities/Occurrence.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { OccurrenceModel } from "../../database/models/OccurrenceModel.ts";

export default class SequelizeOccurrenceRepository
  implements OccurrenceRepository
{
  private occurrenceModel: ModelStatic<OccurrenceModel>;

  constructor(occurrenceModel: ModelStatic<OccurrenceModel>) {
    this.occurrenceModel = occurrenceModel;
  }

  private mapToDomain(occurrenceModel: OccurrenceModel): Occurrence {
    return new Occurrence(occurrenceModel.get({ plain: true }));
  }

  async create(occurrenceData: OccurrenceData): Promise<Occurrence> {
    const created = await this.occurrenceModel.create(occurrenceData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<Occurrence[]> {
    const occurrences = await this.occurrenceModel.findAll();
    return occurrences.map((occurrence) => this.mapToDomain(occurrence));
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
}
