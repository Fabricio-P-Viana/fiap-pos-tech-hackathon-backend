export interface RatingData {
  id?: number;
  occurrenceId: number;
  authorId: number;
  score: number;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Rating {
  id?: number;
  occurrenceId: number;
  authorId: number;
  score: number;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    id,
    occurrenceId,
    authorId,
    score,
    comment,
    createdAt,
    updatedAt,
  }: RatingData) {
    this.id = id;
    this.occurrenceId = occurrenceId;
    this.authorId = authorId;
    this.score = score;
    this.comment = comment;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
