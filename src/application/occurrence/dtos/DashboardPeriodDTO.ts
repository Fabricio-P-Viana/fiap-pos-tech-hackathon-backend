import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { DashboardPeriod } from "../../../domain/repositories/OccurrenceRepository.ts";
import { parseDateOrUndefined } from "./OccurrenceFilterDTO.ts";

export const MAX_DASHBOARD_PERIOD_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DASHBOARD_PERIOD_MS = MAX_DASHBOARD_PERIOD_DAYS * DAY_MS;

export class DashboardPeriodDTO {
  static create(
    query: Record<string, unknown>,
    now: Date = new Date()
  ): DashboardPeriod {
    const from = parseDateOrUndefined(query.from, "from");
    const to = parseDateOrUndefined(query.to, "to");

    const end =
      to ?? (from ? new Date(from.getTime() + MAX_DASHBOARD_PERIOD_MS) : now);
    const start = from ?? new Date(end.getTime() - MAX_DASHBOARD_PERIOD_MS);

    if (start.getTime() > end.getTime()) {
      throw new ValidationError("from must be earlier than to");
    }
    if (end.getTime() - start.getTime() > MAX_DASHBOARD_PERIOD_MS) {
      throw new ValidationError(
        `Dashboard period cannot exceed ${MAX_DASHBOARD_PERIOD_DAYS} days`
      );
    }

    return { from: start, to: end };
  }
}
