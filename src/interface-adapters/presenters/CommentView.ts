import { Comment } from "../../domain/entities/Comment.ts";

export interface CommentViewModel {
  id?: number;
  occurrenceId: number;
  authorId: number;
  authorName: string | null;
  body: string;
  isInternal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class CommentView {
  static render(comment: Comment): CommentViewModel {
    return {
      id: comment.id,
      occurrenceId: comment.occurrenceId,
      authorId: comment.authorId,
      authorName: comment.authorName ?? null,
      body: comment.body,
      isInternal: comment.isInternal ?? false,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  static renderMany(comments: Comment[]): CommentViewModel[] {
    return comments.map((comment) => this.render(comment));
  }
}
