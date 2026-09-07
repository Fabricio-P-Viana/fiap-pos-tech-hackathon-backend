import { Comment } from "../../../src/domain/entities/Comment";

describe("Comment entity", () => {
  it("deve armazenar autor, ocorrência e conteúdo", () => {
    const comment = new Comment({
      occurrenceId: 1,
      authorId: 2,
      body: "Atualização",
      isInternal: true,
    });
    expect(comment.occurrenceId).toBe(1);
    expect(comment.authorId).toBe(2);
    expect(comment.body).toBe("Atualização");
    expect(comment.isInternal).toBe(true);
  });
});
