import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { UserRole } from "../../../domain/entities/User.ts";

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(id: number, actor?: Actor): Promise<void> {
    const existing = await this.commentRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError("Comment", id);

    if (
      actor &&
      actor.role !== UserRole.MANAGER &&
      existing.authorId !== actor.id
    ) {
      throw new UnauthorizedError(id);
    }

    if (!(await this.commentRepository.delete(id)))
      throw new ResourceNotFoundError("Comment", id);
  }
}
