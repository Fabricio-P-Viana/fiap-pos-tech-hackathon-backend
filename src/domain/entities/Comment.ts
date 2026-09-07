export interface CommentData {
  id?: number;
  occurrenceId: number;
  authorId: number;
  body: string;
  isInternal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Comment {
  id?: number;
  occurrenceId: number;
  authorId: number;
  body: string;
  isInternal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    id,
    occurrenceId,
    authorId,
    body,
    isInternal,
    createdAt,
    updatedAt,
  }: CommentData) {
    this.id = id;
    this.occurrenceId = occurrenceId;
    this.authorId = authorId;
    this.body = body;
    this.isInternal = isInternal;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
