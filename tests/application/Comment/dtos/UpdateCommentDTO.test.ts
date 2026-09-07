import { UpdateCommentDTO } from "../../../../src/application/comment/dtos/UpdateCommentDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("UpdateCommentDTO", () => {
  it("deve aceitar atualização parcial", () => {
    expect(
      UpdateCommentDTO.create({ body: " novo texto ", isInternal: true })
    ).toEqual(
      expect.objectContaining({ body: "novo texto", isInternal: true })
    );
  });

  it("deve rejeitar payload vazio", () => {
    expect(() => UpdateCommentDTO.create({})).toThrow(ValidationError);
  });
});
