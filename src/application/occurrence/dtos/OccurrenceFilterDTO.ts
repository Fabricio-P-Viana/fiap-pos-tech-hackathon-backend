import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { OccurrenceStatus } from "../../../domain/enums/occurrence-status.enum.ts";
import { Priority } from "../../../domain/enums/priority.enum.ts";
import type { OccurrenceFilter } from "../../../domain/repositories/OccurrenceRepository.ts";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseIntOrUndefined(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${field} must be a positive integer`);
  }
  return parsed;
}

function parseDateOrUndefined(value: unknown, field: string): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const date = new Date(raw as string);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${field} must be a valid ISO date`);
  }
  return date;
}

export class OccurrenceFilterDTO {
  static create(query: Record<string, unknown>): OccurrenceFilter {
    const {
      status,
      priority,
      categoryId,
      assigneeId,
      search,
      createdFrom,
      createdTo,
      resolvedFrom,
      resolvedTo,
      page,
      limit,
    } = query;

    if (status !== undefined && !Object.values(OccurrenceStatus).includes(status as OccurrenceStatus)) {
      throw new ValidationError("Status filter is invalid");
    }
    if (priority !== undefined && !Object.values(Priority).includes(priority as Priority)) {
      throw new ValidationError("Priority filter is invalid");
    }
    if (search !== undefined && typeof search !== "string") {
      throw new ValidationError("Search filter must be a string");
    }

    const parsedPage = parseIntOrUndefined(page, "page") ?? DEFAULT_PAGE;
    let parsedLimit = parseIntOrUndefined(limit, "limit") ?? DEFAULT_LIMIT;
    if (parsedLimit > MAX_LIMIT) parsedLimit = MAX_LIMIT;

    return {
      status: status as OccurrenceStatus | undefined,
      priority: priority as Priority | undefined,
      categoryId: parseIntOrUndefined(categoryId, "categoryId"),
      assigneeId: parseIntOrUndefined(assigneeId, "assigneeId"),
      search: typeof search === "string" && search.trim().length > 0 ? search.trim() : undefined,
      createdFrom: parseDateOrUndefined(createdFrom, "createdFrom"),
      createdTo: parseDateOrUndefined(createdTo, "createdTo"),
      resolvedFrom: parseDateOrUndefined(resolvedFrom, "resolvedFrom"),
      resolvedTo: parseDateOrUndefined(resolvedTo, "resolvedTo"),
      page: parsedPage,
      limit: parsedLimit,
    };
  }
}
