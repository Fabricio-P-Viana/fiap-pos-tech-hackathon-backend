import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export class FindOneByIdCommentUseCase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(id: number, actor: Actor): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new ResourceNotFoundError("Comment", id);

    if (comment.isInternal && !OccurrencePolicy.isManager(actor)) {
      throw new ResourceNotFoundError("Comment", id);
    }

    const occurrence = await this.occurrenceRepository.findById(
      comment.occurrenceId
    );
    if (!occurrence || !OccurrencePolicy.canView(actor, occurrence)) {
      throw new UnauthorizedError(id);
    }

    return comment;
  }
}
