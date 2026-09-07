import { UpdateRatingDTO } from "../../../../src/application/rating/dtos/UpdateRatingDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("UpdateRatingDTO", () => {
  it("deve aceitar atualização parcial", () => {
    const dto = UpdateRatingDTO.create({ score: 4, comment: " bom " });
    expect(dto.score).toBe(4);
    expect(dto.comment).toBe("bom");
  });

  it.each([{}, { score: 0 }, { score: 6 }, { comment: 10 }])(
    "deve rejeitar dados inválidos: %p",
    (data) =>
      expect(() => UpdateRatingDTO.create(data)).toThrow(ValidationError)
  );
});
