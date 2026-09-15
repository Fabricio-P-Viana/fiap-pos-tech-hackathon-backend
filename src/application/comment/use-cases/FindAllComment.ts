import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

export interface FindAllCommentFilter {
  occurrenceId?: number;
}

export class FindAllCommentUseCase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(filter: FindAllCommentFilter, actor: Actor): Promise<Comment[]> {
    const isManager = OccurrencePolicy.isManager(actor);

    if (filter.occurrenceId === undefined) {
      if (!isManager) {
        throw new ValidationError("occurrenceId is required to list comments");
      }
      return this.commentRepository.findAll();
    }

    const occurrence = await this.occurrenceRepository.findById(
      filter.occurrenceId
    );
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", filter.occurrenceId);
    if (!OccurrencePolicy.canView(actor, occurrence)) {
      throw new UnauthorizedError(filter.occurrenceId);
    }

    const comments = await this.commentRepository.findByOccurrenceId(
      filter.occurrenceId
    );
    return isManager
      ? comments
      : comments.filter((comment) => !comment.isInternal);
  }
}
