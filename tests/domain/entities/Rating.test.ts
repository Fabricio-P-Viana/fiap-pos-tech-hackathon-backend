import { Rating } from "../../../src/domain/entities/Rating";

describe("Rating entity", () => {
  it("deve armazenar avaliação e autor", () => {
    const rating = new Rating({
      occurrenceId: 1,
      authorId: 2,
      score: 5,
      comment: "Excelente",
    });
    expect(rating.occurrenceId).toBe(1);
    expect(rating.authorId).toBe(2);
    expect(rating.score).toBe(5);
    expect(rating.comment).toBe("Excelente");
  });
});
