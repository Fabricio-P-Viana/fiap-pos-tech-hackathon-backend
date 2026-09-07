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
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
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
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

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
    resolvedAt,
    createdAt,
    updatedAt,
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
    this.resolvedAt = resolvedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
