import { OccurrenceEvent } from "../../../src/domain/entities/OccurrenceEvent";
import { OccurrenceEventType } from "../../../src/domain/enums/occurrence-event-type.enum";

describe("OccurrenceEvent entity", () => {
  it("deve armazenar o histórico da ocorrência", () => {
    const event = new OccurrenceEvent({
      id: 1,
      occurrenceId: 10,
      type: OccurrenceEventType.STATUS_CHANGED,
      previousValue: "OPEN",
      newValue: "IN_ANALYSIS",
      note: "Triagem iniciada",
      actorId: 2,
    });
    expect(event.occurrenceId).toBe(10);
    expect(event.type).toBe(OccurrenceEventType.STATUS_CHANGED);
    expect(event.previousValue).toBe("OPEN");
    expect(event.actorId).toBe(2);
  });
});
