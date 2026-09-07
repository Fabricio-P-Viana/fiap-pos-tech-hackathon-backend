import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class FindOneByIdCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}
  async execute(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new ResourceNotFoundError("Comment", id);
    return comment;
  }
}
