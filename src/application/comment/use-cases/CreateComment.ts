import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { UserRole } from "../../../domain/entities/User.ts";
import type { CreateCommentDTO } from "../dtos/CreateCommentDTO.ts";

export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(dto: CreateCommentDTO, actorRole?: UserRole): Promise<Comment> {
    const occurrence = await this.occurrenceRepository.findById(
      dto.occurrenceId
    );
    if (!occurrence)
      throw new ResourceNotFoundError("Occurrence", dto.occurrenceId);

    if (actorRole !== undefined) {
      if (dto.isInternal && actorRole !== UserRole.MANAGER) {
        throw new ValidationError("Only managers can create internal comments");
      }
      const isManager = actorRole === UserRole.MANAGER;
      const isOwner =
        occurrence.requesterId !== undefined &&
        occurrence.requesterId === dto.authorId;
      if (!isManager && !isOwner) {
        throw new UnauthorizedError(dto.occurrenceId);
      }
    }

    return this.commentRepository.create(dto);
  }
}
