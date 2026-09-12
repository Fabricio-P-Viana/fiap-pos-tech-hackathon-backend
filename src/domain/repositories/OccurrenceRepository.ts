import { Occurrence, OccurrenceData } from "../entities/Occurrence.ts";
import { OccurrenceStatus } from "../enums/occurrence-status.enum.ts";
import { Priority } from "../enums/priority.enum.ts";
import type { RatingIndicators } from "./RatingRepository.ts";

export interface OccurrenceFilter {
  requesterId?: number;
  assigneeId?: number | null;
  categoryId?: number;
  status?: OccurrenceStatus;
  priority?: Priority;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  resolvedFrom?: Date;
  resolvedTo?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardIndicators {
  total: number;
  /** Indicadores de satisfação; ausente quando não há fonte de avaliações. */
  ratings?: RatingIndicators;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Array<{ categoryId: number; categoryName: string; total: number }>;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionHours: number | null;
}

export interface OccurrenceRepository {
  create(_occurrenceData: OccurrenceData): Promise<Occurrence>;
  findAll(_filter?: OccurrenceFilter): Promise<PaginatedResult<Occurrence>>;
  findById(_id: number): Promise<Occurrence | null>;
  update(
    _id: number,
    _occurrenceData: Partial<OccurrenceData>
  ): Promise<Occurrence | null>;
  delete(_id: number): Promise<boolean>;
  getDashboardIndicators(): Promise<DashboardIndicators>;
}
