import { OccurrenceEvent } from "../../domain/entities/OccurrenceEvent.ts";

export default class OccurrenceEventView {
  static render(event: OccurrenceEvent): OccurrenceEvent {
    return event;
  }

  static renderMany(events: OccurrenceEvent[]): OccurrenceEvent[] {
    return events.map((event) => this.render(event));
  }
}
