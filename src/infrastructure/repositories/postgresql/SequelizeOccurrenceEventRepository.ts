import type { ModelStatic } from "sequelize";
import {
  OccurrenceEvent,
  type OccurrenceEventData,
} from "../../../domain/entities/OccurrenceEvent.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { OccurrenceEventModel } from "../../database/models/OccurrenceEventModel.ts";

export default class SequelizeOccurrenceEventRepository
  implements OccurrenceEventRepository
{
  private occurrenceEventModel: ModelStatic<OccurrenceEventModel>;

  constructor(occurrenceEventModel: ModelStatic<OccurrenceEventModel>) {
    this.occurrenceEventModel = occurrenceEventModel;
  }

  private mapToDomain(model: OccurrenceEventModel): OccurrenceEvent {
    return new OccurrenceEvent(model.get({ plain: true }));
  }

  async create(eventData: OccurrenceEventData): Promise<OccurrenceEvent> {
    const created = await this.occurrenceEventModel.create(eventData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<OccurrenceEvent[]> {
    const events = await this.occurrenceEventModel.findAll();
    return events.map((event) => this.mapToDomain(event));
  }

  async findByOccurrenceId(occurrenceId: number): Promise<OccurrenceEvent[]> {
    const events = await this.occurrenceEventModel.findAll({
      where: { occurrenceId },
      order: [["createdAt", "ASC"]],
    });
    return events.map((event) => this.mapToDomain(event));
  }

  async findById(id: number): Promise<OccurrenceEvent | null> {
    const event = await this.occurrenceEventModel.findByPk(id);
    return event ? this.mapToDomain(event) : null;
  }

  async update(
    id: number,
    eventData: Partial<OccurrenceEventData>
  ): Promise<OccurrenceEvent | null> {
    const event = await this.occurrenceEventModel.findByPk(id);
    if (!event) return null;

    await event.update(eventData);
    return this.mapToDomain(event);
  }

  async delete(id: number): Promise<boolean> {
    const event = await this.occurrenceEventModel.findByPk(id);
    if (!event) return false;

    await event.destroy();
    return true;
  }
}
