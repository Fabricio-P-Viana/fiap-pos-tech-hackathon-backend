import { Occurrence } from "../../domain/entities/Occurrence.ts";

export default class OccurrenceView {
  static render(occurrence: Occurrence): Occurrence {
    return occurrence;
  }

  static renderMany(occurrences: Occurrence[]): Occurrence[] {
    return occurrences.map((occurrence) => this.render(occurrence));
  }
}
