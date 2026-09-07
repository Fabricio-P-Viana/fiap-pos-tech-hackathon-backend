import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import { ResourceNotFoundError } from "../../../domain/errors/ResourceNotFoundError.ts";

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}
  async execute(id: number): Promise<void> {
    if (!(await this.commentRepository.delete(id)))
      throw new ResourceNotFoundError("Comment", id);
  }
}
