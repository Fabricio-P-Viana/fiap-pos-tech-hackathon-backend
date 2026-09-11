import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import { UserRole } from "../../../domain/entities/User.ts";

export interface FindAllCommentFilter {
  occurrenceId?: number;
}

export class FindAllCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(
    filter: FindAllCommentFilter = {},
    actorRole?: UserRole
  ): Promise<Comment[]> {
    const comments = filter.occurrenceId
      ? await this.commentRepository.findByOccurrenceId(filter.occurrenceId)
      : await this.commentRepository.findAll();

    if (actorRole === UserRole.MANAGER) return comments;
    return comments.filter((comment) => !comment.isInternal);
  }
}
