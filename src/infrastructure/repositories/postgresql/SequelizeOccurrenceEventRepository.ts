import type { ModelStatic } from "sequelize";
import {
  OccurrenceEvent,
  type OccurrenceEventData,
} from "../../../domain/entities/OccurrenceEvent.ts";
import { OccurrenceEventType } from "../../../domain/enums/occurrence-event-type.enum.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { OccurrenceEventModel } from "../../database/models/OccurrenceEventModel.ts";
import type { UserModel } from "../../database/models/UserModel.ts";

export default class SequelizeOccurrenceEventRepository
  implements OccurrenceEventRepository
{
  private occurrenceEventModel: ModelStatic<OccurrenceEventModel>;
  private userModel?: ModelStatic<UserModel>;

  constructor(
    occurrenceEventModel: ModelStatic<OccurrenceEventModel>,
    userModel?: ModelStatic<UserModel>
  ) {
    this.occurrenceEventModel = occurrenceEventModel;
    this.userModel = userModel;
  }

  /**
   * Traz o autor da ação e o título da ocorrência para que a linha do tempo
   * seja legível sem chamadas extras (e sem exigir permissão de listar
   * usuários, que o solicitante não tem).
   */
  private static readonly TIMELINE_INCLUDES = [
    { association: "actor", attributes: ["id", "name"], required: false },
    { association: "occurrence", attributes: ["id", "title"], required: false },
  ];

  private mapToDomain(model: OccurrenceEventModel): OccurrenceEvent {
    const plain = model.get({ plain: true }) as OccurrenceEventData & {
      actor?: { name?: string } | null;
      occurrence?: { title?: string } | null;
    };

    const event = new OccurrenceEvent(plain);
    event.actorName = plain.actor?.name ?? null;
    event.occurrenceTitle = plain.occurrence?.title ?? null;
    return event;
  }

  /**
   * Eventos de responsável guardam ids de usuário; aqui eles são resolvidos
   * em nomes com uma única consulta para todo o conjunto.
   */
  private async withAssigneeLabels(
    events: OccurrenceEvent[]
  ): Promise<OccurrenceEvent[]> {
    const ids = new Set<number>();
    for (const event of events) {
      if (event.type !== OccurrenceEventType.ASSIGNEE_CHANGED) continue;
      for (const value of [event.previousValue, event.newValue]) {
        const parsed = Number(value);
        if (value && Number.isInteger(parsed) && parsed > 0) ids.add(parsed);
      }
    }
    if (!this.userModel || ids.size === 0) return events;

    const users = await this.userModel.findAll({
      where: { id: [...ids] },
      attributes: ["id", "name"],
    });
    const nameById = new Map(users.map((user) => [user.id, user.name]));

    const label = (value?: string | null): string | null => {
      if (!value) return null;
      return nameById.get(Number(value)) ?? value;
    };

    for (const event of events) {
      if (event.type !== OccurrenceEventType.ASSIGNEE_CHANGED) continue;
      event.previousLabel = label(event.previousValue);
      event.newLabel = label(event.newValue);
    }
    return events;
  }

  async create(eventData: OccurrenceEventData): Promise<OccurrenceEvent> {
    const created = await this.occurrenceEventModel.create(eventData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<OccurrenceEvent[]> {
    const events = await this.occurrenceEventModel.findAll({
      include: SequelizeOccurrenceEventRepository.TIMELINE_INCLUDES,
      order: [["createdAt", "DESC"]],
    });
    return this.withAssigneeLabels(
      events.map((event) => this.mapToDomain(event))
    );
  }

  async findByOccurrenceId(occurrenceId: number): Promise<OccurrenceEvent[]> {
    const events = await this.occurrenceEventModel.findAll({
      where: { occurrenceId },
      include: SequelizeOccurrenceEventRepository.TIMELINE_INCLUDES,
      order: [["createdAt", "ASC"]],
    });
    return this.withAssigneeLabels(
      events.map((event) => this.mapToDomain(event))
    );
  }

  async findById(id: number): Promise<OccurrenceEvent | null> {
    const event = await this.occurrenceEventModel.findByPk(id, {
      include: SequelizeOccurrenceEventRepository.TIMELINE_INCLUDES,
    });
    if (!event) return null;
    const [mapped] = await this.withAssigneeLabels([this.mapToDomain(event)]);
    return mapped;
  }

  async update(
    id: number,
    eventData: Partial<OccurrenceEventData>
  ): Promise<OccurrenceEvent | null> {
    const event = await this.occurrenceEventModel.findByPk(id);
    if (!event) return null;

    await event.update(eventData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const event = await this.occurrenceEventModel.findByPk(id);
    if (!event) return false;

    await event.destroy();
    return true;
  }
}
