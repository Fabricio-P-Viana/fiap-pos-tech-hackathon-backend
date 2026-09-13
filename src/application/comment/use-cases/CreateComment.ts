import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";
import { ValidationError } from "../../../domain/errors/ValidationError.ts";
import { UserRole } from "../../../domain/entities/User.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";
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
      const actor = { id: dto.authorId, role: actorRole };
      if (!OccurrencePolicy.canView(actor, occurrence)) {
        throw new UnauthorizedError(dto.occurrenceId);
      }
      // Depois de resolvida ou cancelada a ocorrência é histórico: só a
      // avaliação do solicitante é aceita.
      if (!OccurrencePolicy.canComment(actor, occurrence)) {
        throw new ValidationError(
          "Occurrences in a final status no longer accept comments"
        );
      }
    }

    return this.commentRepository.create(dto);
  }
}
