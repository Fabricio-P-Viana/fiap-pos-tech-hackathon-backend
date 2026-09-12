import { Occurrence } from "../../domain/entities/Occurrence.ts";

export interface OccurrenceViewModel {
  id?: number;
  requesterId: number;
  requesterName: string | null;
  assigneeId?: number | null;
  assigneeName: string | null;
  categoryId: number;
  categoryName: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  locationText?: string | null;
  locationReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolution?: string | null;
  cancellationReason?: string | null;
  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class OccurrenceView {
  static render(occurrence: Occurrence): OccurrenceViewModel {
    return {
      id: occurrence.id,
      requesterId: occurrence.requesterId,
      requesterName: occurrence.requesterName ?? null,
      assigneeId: occurrence.assigneeId ?? null,
      assigneeName: occurrence.assigneeName ?? null,
      categoryId: occurrence.categoryId,
      categoryName: occurrence.categoryName ?? null,
      title: occurrence.title,
      description: occurrence.description,
      status: occurrence.status,
      priority: occurrence.priority,
      locationText: occurrence.locationText ?? null,
      locationReference: occurrence.locationReference ?? null,
      latitude: occurrence.latitude ?? null,
      longitude: occurrence.longitude ?? null,
      resolution: occurrence.resolution ?? null,
      cancellationReason: occurrence.cancellationReason ?? null,
      resolvedAt: occurrence.resolvedAt ?? null,
      createdAt: occurrence.createdAt,
      updatedAt: occurrence.updatedAt,
    };
  }

  static renderMany(occurrences: Occurrence[]): OccurrenceViewModel[] {
    return occurrences.map((occurrence) => this.render(occurrence));
  }
}
