import { Rating, RatingData } from "../entities/Rating.ts";

export interface RatingRepository {
  create(_ratingData: RatingData): Promise<Rating>;
  findAll(): Promise<Rating[]>;
  findById(_id: number): Promise<Rating | null>;
  update(_id: number, _ratingData: Partial<RatingData>): Promise<Rating | null>;
  delete(_id: number): Promise<boolean>;
}
