import { Rating, RatingData } from "../entities/Rating.ts";

export interface RatingIndicators {
  count: number;
  average: number | null;
  /** Quantidade por nota, de "1" a "5". */
  distribution: Record<string, number>;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    count: number;
    average: number;
  }>;
}

export interface RatingFilter {
  occurrenceId?: number;
  authorId?: number;
}

export interface RatingRepository {
  create(_ratingData: RatingData): Promise<Rating>;
  findAll(_filter?: RatingFilter): Promise<Rating[]>;
  getIndicators(): Promise<RatingIndicators>;
  findById(_id: number): Promise<Rating | null>;
  update(_id: number, _ratingData: Partial<RatingData>): Promise<Rating | null>;
  delete(_id: number): Promise<boolean>;
}
