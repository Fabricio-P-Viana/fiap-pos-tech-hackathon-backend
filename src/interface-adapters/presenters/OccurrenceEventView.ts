import { OccurrenceEvent } from "../../domain/entities/OccurrenceEvent.ts";

export interface OccurrenceEventViewModel {
  id?: number;
  occurrenceId: number;
  occurrenceTitle: string | null;
  type: string;
  previousValue: string | null;
  newValue: string | null;
  /** previousValue/newValue já resolvidos em nome quando são ids de usuário. */
  previousLabel: string | null;
  newLabel: string | null;
  note: string | null;
  actorId: number;
  actorName: string | null;
  createdAt?: Date;
}

export default class OccurrenceEventView {
  static render(event: OccurrenceEvent): OccurrenceEventViewModel {
    return {
      id: event.id,
      occurrenceId: event.occurrenceId,
      occurrenceTitle: event.occurrenceTitle ?? null,
      type: event.type,
      previousValue: event.previousValue ?? null,
      newValue: event.newValue ?? null,
      previousLabel: event.previousLabel ?? event.previousValue ?? null,
      newLabel: event.newLabel ?? event.newValue ?? null,
      note: event.note ?? null,
      actorId: event.actorId,
      actorName: event.actorName ?? null,
      createdAt: event.createdAt,
    };
  }

  static renderMany(events: OccurrenceEvent[]): OccurrenceEventViewModel[] {
    return events.map((event) => this.render(event));
  }
}
