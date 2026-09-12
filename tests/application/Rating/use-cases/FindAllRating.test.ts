import { FindAllRatingUseCase } from "../../../../src/application/rating/use-cases/FindAllRating";
import { UserRole } from "../../../../src/domain/entities/User";

describe("FindAllRatingUseCase", () => {
  function build() {
    const ratingRepository = { findAll: jest.fn().mockResolvedValue([]) } as any;
    return { ratingRepository, useCase: new FindAllRatingUseCase(ratingRepository) };
  }

  it("limita o solicitante às próprias avaliações", async () => {
    const { ratingRepository, useCase } = build();

    await useCase.execute({}, { id: 7, role: UserRole.REQUESTER });

    expect(ratingRepository.findAll).toHaveBeenCalledWith({ authorId: 7 });
  });

  it("ignora authorId informado pelo solicitante", async () => {
    const { ratingRepository, useCase } = build();

    await useCase.execute({ authorId: 99 }, { id: 7, role: UserRole.REQUESTER });

    expect(ratingRepository.findAll).toHaveBeenCalledWith({ authorId: 7 });
  });

  it("mantém o escopo amplo para o gestor", async () => {
    const { ratingRepository, useCase } = build();

    await useCase.execute(
      { occurrenceId: 3 },
      { id: 1, role: UserRole.MANAGER }
    );

    expect(ratingRepository.findAll).toHaveBeenCalledWith({ occurrenceId: 3 });
  });
});
