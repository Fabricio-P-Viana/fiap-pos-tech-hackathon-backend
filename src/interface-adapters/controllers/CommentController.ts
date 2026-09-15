import type { ReqResNextFunction } from "../types/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { CreateCommentDTO } from "../../application/comment/dtos/CreateCommentDTO.ts";
import type { CreateCommentUseCase } from "../../application/comment/use-cases/CreateComment.ts";
import type { FindAllCommentUseCase } from "../../application/comment/use-cases/FindAllComment.ts";
import type { FindOneByIdCommentUseCase } from "../../application/comment/use-cases/FindOneByIdComment.ts";
import type { UpdateCommentUseCase } from "../../application/comment/use-cases/UpdateComment.ts";
import type { DeleteCommentUseCase } from "../../application/comment/use-cases/DeleteComment.ts";
import { UpdateCommentDTO } from "../../application/comment/dtos/UpdateCommentDTO.ts";
import CommentView from "../presenters/CommentView.ts";
import type { Actor } from "../../domain/services/OccurrencePolicy.ts";

export default class CommentController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly findAllCommentUseCase: FindAllCommentUseCase,
    private readonly findOneByIdCommentUseCase: FindOneByIdCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase
  ) {}

  private parseId(id: string | string[]): number {
    const value = parseInt(Array.isArray(id) ? id[0] : id, 10);
    if (Number.isNaN(value))
      throw new ValidationError("Comment ID must be a valid number");
    return value;
  }

  private authorId(req: ReqResNextFunction["req"]): number {
    const authorId = req.user?.userId;
    if (!authorId) throw new ValidationError("Authenticated user is required");
    return authorId;
  }

  private actor(req: ReqResNextFunction["req"]): Actor {
    if (!req.user)
      throw new ValidationError("Authenticated user is required");
    return { id: req.user.userId, role: req.user.role };
  }

  async create({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const dto = CreateCommentDTO.create({
        ...req.body,
        authorId: this.authorId(req),
      });
      const comment = await this.createCommentUseCase.execute(
        dto,
        req.user?.role
      );
      res.status(201).json(CommentView.render(comment));
    } catch (error) {
      next(error);
    }
  }

  async findAll({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const occurrenceIdRaw = req.query.occurrenceId as string | undefined;
      const occurrenceId = occurrenceIdRaw
        ? parseInt(occurrenceIdRaw, 10)
        : undefined;
      if (occurrenceIdRaw && Number.isNaN(occurrenceId))
        throw new ValidationError("occurrenceId must be a valid number");

      const comments = await this.findAllCommentUseCase.execute(
        { occurrenceId },
        this.actor(req)
      );
      res.status(200).json(CommentView.renderMany(comments));
    } catch (error) {
      next(error);
    }
  }

  async findById({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          CommentView.render(
            await this.findOneByIdCommentUseCase.execute(
              this.parseId(req.params.id),
              this.actor(req)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async update({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          CommentView.render(
            await this.updateCommentUseCase.execute(
              this.parseId(req.params.id),
              UpdateCommentDTO.create(req.body),
              this.actor(req)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async delete({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      await this.deleteCommentUseCase.execute(
        this.parseId(req.params.id),
        this.actor(req)
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
