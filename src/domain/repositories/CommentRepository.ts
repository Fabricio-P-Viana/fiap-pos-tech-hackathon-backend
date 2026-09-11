import { Comment, CommentData } from "../entities/Comment.ts";

export interface CommentRepository {
  create(_commentData: CommentData): Promise<Comment>;
  findAll(): Promise<Comment[]>;
  findByOccurrenceId(_occurrenceId: number): Promise<Comment[]>;
  findById(_id: number): Promise<Comment | null>;
  update(
    _id: number,
    _commentData: Partial<CommentData>
  ): Promise<Comment | null>;
  delete(_id: number): Promise<boolean>;
}
