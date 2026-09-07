import { CreateRatingUseCase } from "../../../../src/application/rating/use-cases/CreateRating";
import { CreateRatingDTO } from "../../../../src/application/rating/dtos/CreateRatingDTO";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateRatingUseCase", () => {
  const dto = CreateRatingDTO.create({
    occurrenceId: 1,
    authorId: 2,
    score: 5,
  });

  it("deve criar avaliação para ocorrência resolvida", async () => {
    const occurrenceRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 1, status: OccurrenceStatus.RESOLVED }),
    } as any;
    const ratingRepository = {
      create: jest.fn().mockResolvedValue({ id: 7, ...dto }),
    } as any;
    const result = await new CreateRatingUseCase(
      ratingRepository,
      occurrenceRepository
    ).execute(dto);
    expect(ratingRepository.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(7);
  });

  it("deve rejeitar avaliação antes da resolução", async () => {
    const occurrenceRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 1, status: OccurrenceStatus.IN_PROGRESS }),
    } as any;
    await expect(
      new CreateRatingUseCase({} as any, occurrenceRepository).execute(dto)
    ).rejects.toThrow(ValidationError);
  });
});
