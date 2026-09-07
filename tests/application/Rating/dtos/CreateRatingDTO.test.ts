import { CreateRatingDTO } from "../../../../src/application/rating/dtos/CreateRatingDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateRatingDTO", () => {
  it("deve criar avaliação válida", () => {
    const dto = CreateRatingDTO.create({
      occurrenceId: 1,
      authorId: 2,
      score: 5,
      comment: " ótimo ",
    });
    expect(dto.score).toBe(5);
    expect(dto.comment).toBe("ótimo");
  });

  it.each([
    { score: 0 },
    { score: 6 },
    { score: 2.5 },
    { authorId: 0 },
    { comment: 10 },
  ])("deve rejeitar dados inválidos: %p", (override) =>
    expect(() =>
      CreateRatingDTO.create({
        occurrenceId: 1,
        authorId: 2,
        score: 3,
        ...override,
      })
    ).toThrow(ValidationError)
  );
});
