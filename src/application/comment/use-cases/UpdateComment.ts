import type { Comment } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";
import type { UpdateCommentDTO } from "../dtos/UpdateCommentDTO.ts";

export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}
  async execute(id: number, dto: UpdateCommentDTO): Promise<Comment> {
    const updated = await this.commentRepository.update(id, {
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.isInternal !== undefined && { isInternal: dto.isInternal }),
    });
    if (!updated) throw new ResourceNotFoundError("Comment", id);
    return updated;
  }
}
