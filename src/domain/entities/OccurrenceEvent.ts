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
  }
}
