import { CreateCommentDTO } from "../../../../src/application/comment/dtos/CreateCommentDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateCommentDTO", () => {
  it("deve normalizar comentário válido", () => {
    const dto = CreateCommentDTO.create({
      occurrenceId: 1,
      authorId: 2,
      body: " comentário ",
    });
    expect(dto.body).toBe("comentário");
    expect(dto.isInternal).toBe(false);
  });

  it.each([
    { occurrenceId: 0 },
    { authorId: "2" },
    { body: " " },
    { isInternal: "yes" },
  ])("deve rejeitar dados inválidos: %p", (override) =>
    expect(() =>
      CreateCommentDTO.create({
        occurrenceId: 1,
        authorId: 2,
        body: "ok",
        ...override,
      })
    ).toThrow(ValidationError)
  );
});
