import {
  OccurrenceEvent,
  OccurrenceEventData,
} from "../entities/OccurrenceEvent.ts";

export interface OccurrenceEventRepository {
  create(_eventData: OccurrenceEventData): Promise<OccurrenceEvent>;
  findAll(): Promise<OccurrenceEvent[]>;
  findByOccurrenceId(_occurrenceId: number): Promise<OccurrenceEvent[]>;
  findById(_id: number): Promise<OccurrenceEvent | null>;
  update(
    _id: number,
    _eventData: Partial<OccurrenceEventData>
  ): Promise<OccurrenceEvent | null>;
  delete(_id: number): Promise<boolean>;
}
