import type { ModelStatic } from "sequelize";
import { Comment, type CommentData } from "../../../domain/entities/Comment.ts";
import type { CommentRepository } from "../../../domain/repositories/CommentRepository.ts";
import type { CommentModel } from "../../database/models/CommentModel.ts";

export default class SequelizeCommentRepository implements CommentRepository {
  private commentModel: ModelStatic<CommentModel>;

  constructor(commentModel: ModelStatic<CommentModel>) {
    this.commentModel = commentModel;
  }

  private static readonly AUTHOR_INCLUDE = [
    { association: "author", attributes: ["id", "name"], required: false },
  ];

  private mapToDomain(commentModel: CommentModel): Comment {
    const plain = commentModel.get({ plain: true }) as CommentData & {
      author?: { name?: string } | null;
    };

    const comment = new Comment(plain);
    comment.authorName = plain.author?.name ?? null;
    return comment;
  }

  async create(commentData: CommentData): Promise<Comment> {
    const created = await this.commentModel.create(commentData);
    return (await this.findById(created.id)) ?? this.mapToDomain(created);
  }

  async findAll(): Promise<Comment[]> {
    const comments = await this.commentModel.findAll({
      include: SequelizeCommentRepository.AUTHOR_INCLUDE,
      order: [["createdAt", "ASC"]],
    });
    return comments.map((comment) => this.mapToDomain(comment));
  }

  async findByOccurrenceId(occurrenceId: number): Promise<Comment[]> {
    const comments = await this.commentModel.findAll({
      where: { occurrenceId },
      include: SequelizeCommentRepository.AUTHOR_INCLUDE,
      order: [["createdAt", "ASC"]],
    });
    return comments.map((comment) => this.mapToDomain(comment));
  }

  async findById(id: number): Promise<Comment | null> {
    const comment = await this.commentModel.findByPk(id, {
      include: SequelizeCommentRepository.AUTHOR_INCLUDE,
    });
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
