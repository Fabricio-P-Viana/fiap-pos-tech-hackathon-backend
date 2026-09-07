import {
  OccurrenceStatus,
  STATUS_TRANSITIONS,
  isFinalStatus,
} from "../../../src/domain/enums/occurrence-status.enum";

describe("Occurrence status rules", () => {
  it("deve permitir apenas as transições previstas", () => {
    expect(STATUS_TRANSITIONS[OccurrenceStatus.OPEN]).toEqual([
      OccurrenceStatus.IN_ANALYSIS,
      OccurrenceStatus.CANCELLED,
    ]);
    expect(STATUS_TRANSITIONS[OccurrenceStatus.IN_PROGRESS]).toContain(
      OccurrenceStatus.RESOLVED
    );
    expect(STATUS_TRANSITIONS[OccurrenceStatus.OPEN]).not.toContain(
      OccurrenceStatus.RESOLVED
    );
  });

  it("deve identificar estados finais", () => {
    expect(isFinalStatus(OccurrenceStatus.RESOLVED)).toBe(true);
    expect(isFinalStatus(OccurrenceStatus.CANCELLED)).toBe(true);
    expect(isFinalStatus(OccurrenceStatus.OPEN)).toBe(false);
  });
});
