import type { ModelStatic } from "sequelize";
import { Comment, type CommentData } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import type { CommentModel } from "../../database/models/CommentModel.ts";

export default class SequelizeCommentRepository implements CommentRepository {
  private commentModel: ModelStatic<CommentModel>;

  constructor(commentModel: ModelStatic<CommentModel>) {
    this.commentModel = commentModel;
  }

  private mapToDomain(commentModel: CommentModel): Comment {
    return new Comment(commentModel.get({ plain: true }));
  }

  async create(commentData: CommentData): Promise<Comment> {
    const created = await this.commentModel.create(commentData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<Comment[]> {
    const comments = await this.commentModel.findAll();
    return comments.map((comment) => this.mapToDomain(comment));
  }

  async findByOccurrenceId(occurrenceId: number): Promise<Comment[]> {
    const comments = await this.commentModel.findAll({
      where: { occurrenceId },
      order: [["createdAt", "ASC"]],
    });
    return comments.map((comment) => this.mapToDomain(comment));
  }

  async findById(id: number): Promise<Comment | null> {
    const comment = await this.commentModel.findByPk(id);
    return comment ? this.mapToDomain(comment) : null;
  }

  async update(
    id: number,
    commentData: Partial<CommentData>
  ): Promise<Comment | null> {
    const comment = await this.commentModel.findByPk(id);
    if (!comment) return null;

    await comment.update(commentData);
    return this.mapToDomain(comment);
  }

  async delete(id: number): Promise<boolean> {
    const comment = await this.commentModel.findByPk(id);
    if (!comment) return false;

    await comment.destroy();
    return true;
  }
}
