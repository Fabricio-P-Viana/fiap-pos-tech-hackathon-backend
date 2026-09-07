export enum OccurrenceStatus {
  OPEN = "OPEN",
  IN_ANALYSIS = "IN_ANALYSIS",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CANCELLED = "CANCELLED",
}

export const STATUS_TRANSITIONS: Record<OccurrenceStatus, OccurrenceStatus[]> =
  {
    [OccurrenceStatus.OPEN]: [
      OccurrenceStatus.IN_ANALYSIS,
      OccurrenceStatus.CANCELLED,
    ],
    [OccurrenceStatus.IN_ANALYSIS]: [
      OccurrenceStatus.IN_PROGRESS,
      OccurrenceStatus.CANCELLED,
    ],
    [OccurrenceStatus.IN_PROGRESS]: [
      OccurrenceStatus.RESOLVED,
      OccurrenceStatus.CANCELLED,
    ],
    [OccurrenceStatus.RESOLVED]: [],
    [OccurrenceStatus.CANCELLED]: [],
  };

export function isFinalStatus(status: OccurrenceStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}
