import { OccurrenceEventType } from "../../../src/domain/enums/occurrence-event-type.enum";

describe("OccurrenceEventType enum", () => {
  it("deve conter os tipos de histórico previstos", () => {
    expect(Object.values(OccurrenceEventType)).toEqual([
      "CREATED",
      "STATUS_CHANGED",
      "PRIORITY_CHANGED",
      "ASSIGNEE_CHANGED",
    ]);
  });
});
