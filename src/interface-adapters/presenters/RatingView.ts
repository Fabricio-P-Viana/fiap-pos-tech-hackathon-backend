import { Rating } from "../../domain/entities/Rating.ts";

export default class RatingView {
  static render(rating: Rating): Rating {
    return rating;
  }

  static renderMany(ratings: Rating[]): Rating[] {
    return ratings.map((rating) => this.render(rating));
  }
}
