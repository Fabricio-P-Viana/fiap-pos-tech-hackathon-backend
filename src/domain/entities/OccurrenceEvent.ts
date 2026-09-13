import { OccurrenceEventType } from "../enums/occurrence-event-type.enum.ts";

export { OccurrenceEventType } from "../enums/occurrence-event-type.enum.ts";

export interface OccurrenceEventData {
  id?: number;
  occurrenceId: number;
  type: OccurrenceEventType;
  previousValue?: string | null;
  newValue?: string | null;
  note?: string | null;
  actorId: number;
  createdAt?: Date;
  updatedAt?: Date;
  /** Projeções somente leitura preenchidas pelo repositório. */
  actorName?: string | null;
  occurrenceTitle?: string | null;
  /**
   * Versões legíveis de previousValue/newValue: para ASSIGNEE_CHANGED os
   * valores gravados são ids de usuário, e aqui viram os nomes.
   */
  previousLabel?: string | null;
  newLabel?: string | null;
}

export class OccurrenceEvent {
  id?: number;
  occurrenceId: number;
  type: OccurrenceEventType;
  previousValue?: string | null;
  newValue?: string | null;
  note?: string | null;
  actorId: number;
  createdAt?: Date;
  updatedAt?: Date;
  actorName?: string | null;
  occurrenceTitle?: string | null;
  previousLabel?: string | null;
  newLabel?: string | null;

  constructor({
    id,
    occurrenceId,
    type,
    previousValue,
    newValue,
    note,
    actorId,
    createdAt,
    updatedAt,
    actorName,
    occurrenceTitle,
    previousLabel,
    newLabel,
  }: OccurrenceEventData) {
    this.id = id;
    this.occurrenceId = occurrenceId;
    this.type = type;
    this.previousValue = previousValue;
    this.newValue = newValue;
    this.note = note;
    this.actorId = actorId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.actorName = actorName;
    this.occurrenceTitle = occurrenceTitle;
    this.previousLabel = previousLabel;
    this.newLabel = newLabel;
  }
}
