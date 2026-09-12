import { OccurrenceStatus } from "../enums/occurrence-status.enum.ts";
import { Priority } from "../enums/priority.enum.ts";

export { OccurrenceStatus } from "../enums/occurrence-status.enum.ts";
export { Priority as OccurrencePriority } from "../enums/priority.enum.ts";

export interface OccurrenceData {
  id?: number;
  requesterId: number;
  assigneeId?: number | null;
  categoryId: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  priority: Priority;
  locationText?: string | null;
  locationReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolution?: string | null;
  cancellationReason?: string | null;
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  /**
   * Projeções somente leitura preenchidas pelo repositório quando os
   * relacionamentos são carregados. Nunca são persistidas.
   */
  requesterName?: string | null;
  assigneeName?: string | null;
  categoryName?: string | null;
}

export class Occurrence {
  id?: number;
  requesterId: number;
  assigneeId?: number | null;
  categoryId: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  priority: Priority;
  locationText?: string | null;
  locationReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolution?: string | null;
  cancellationReason?: string | null;
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  requesterName?: string | null;
  assigneeName?: string | null;
  categoryName?: string | null;

  constructor({
    id,
    requesterId,
    assigneeId,
    categoryId,
    title,
    description,
    status,
    priority,
    locationText,
    locationReference,
    latitude,
    longitude,
    resolution,
    cancellationReason,
    resolvedAt,
    createdAt,
    updatedAt,
    requesterName,
    assigneeName,
    categoryName,
  }: OccurrenceData) {
    this.id = id;
    this.requesterId = requesterId;
    this.assigneeId = assigneeId;
    this.categoryId = categoryId;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.locationText = locationText;
    this.locationReference = locationReference;
    this.latitude = latitude;
    this.longitude = longitude;
    this.resolution = resolution;
    this.cancellationReason = cancellationReason;
    this.resolvedAt = resolvedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.requesterName = requesterName;
    this.assigneeName = assigneeName;
    this.categoryName = categoryName;
  }
}
