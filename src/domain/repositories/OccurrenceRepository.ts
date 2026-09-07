import { Occurrence, OccurrenceData } from "../entities/Occurrence.ts";

export interface OccurrenceRepository {
  create(_occurrenceData: OccurrenceData): Promise<Occurrence>;
  findAll(): Promise<Occurrence[]>;
  findById(_id: number): Promise<Occurrence | null>;
  update(
    _id: number,
    _occurrenceData: Partial<OccurrenceData>
  ): Promise<Occurrence | null>;
  delete(_id: number): Promise<boolean>;
}
