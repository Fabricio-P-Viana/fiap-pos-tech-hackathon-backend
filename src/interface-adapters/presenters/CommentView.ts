import { Comment } from "../../domain/entities/Comment.ts";

export default class CommentView {
  static render(comment: Comment): Comment {
    return comment;
  }

  static renderMany(comments: Comment[]): Comment[] {
    return comments.map((comment) => this.render(comment));
  }
}
