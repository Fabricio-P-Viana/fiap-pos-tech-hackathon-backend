import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import type { UpdateCommentDTO } from "../dtos/UpdateCommentDTO.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { UserRole } from "../../../domain/entities/User.ts";

export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(
    id: number,
    dto: UpdateCommentDTO,
    actor?: Actor
  ): Promise<Comment> {
    const existing = await this.commentRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError("Comment", id);

    // Somente o autor pode editar o próprio comentário; gestores podem
    // apenas reclassificar a visibilidade (isInternal) para moderação.
    if (actor && actor.role !== UserRole.MANAGER && existing.authorId !== actor.id) {
      throw new UnauthorizedError(id);
    }

    const updated = await this.commentRepository.update(id, {
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.isInternal !== undefined && { isInternal: dto.isInternal }),
    });
    if (!updated) throw new ResourceNotFoundError("Comment", id);
    return updated;
  }
}
