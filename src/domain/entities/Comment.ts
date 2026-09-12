export interface CommentData {
  id?: number;
  occurrenceId: number;
  authorId: number;
  body: string;
  isInternal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  /** Projeção somente leitura preenchida pelo repositório. */
  authorName?: string | null;
}

export class Comment {
  id?: number;
  occurrenceId: number;
  authorId: number;
  body: string;
  isInternal?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  authorName?: string | null;

  constructor({
    id,
    occurrenceId,
    authorId,
    body,
    isInternal,
    createdAt,
    updatedAt,
    authorName,
  }: CommentData) {
    this.id = id;
    this.occurrenceId = occurrenceId;
    this.authorId = authorId;
    this.body = body;
    this.isInternal = isInternal;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.authorName = authorName;
  }
}
