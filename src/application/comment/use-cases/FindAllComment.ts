import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";

export class FindAllCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}
  execute(): Promise<Comment[]> {
    return this.commentRepository.findAll();
  }
}
