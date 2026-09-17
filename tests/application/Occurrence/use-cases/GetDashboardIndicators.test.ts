import { GetDashboardIndicatorsUseCase } from "../../../../src/application/occurrence/use-cases/GetDashboardIndicators";
import type {
  DashboardIndicators,
  OccurrenceRepository,
} from "../../../../src/domain/repositories/OccurrenceRepository";
import type {
  RatingIndicators,
  RatingRepository,
} from "../../../../src/domain/repositories/RatingRepository";

const period = {
  from: new Date("2026-08-01T00:00:00.000Z"),
  to: new Date("2026-08-31T00:00:00.000Z"),
};

const indicators: DashboardIndicators = {
  total: 3,
  byStatus: { OPEN: 2, RESOLVED: 1 },
  byPriority: { HIGH: 3 },
  byCategory: [{ categoryId: 1, categoryName: "Iluminação", total: 3 }],
  open: 2,
  inProgress: 0,
  resolved: 1,
  averageResolutionHours: 12,
};

const ratingIndicators: RatingIndicators = {
  count: 1,
  average: 5,
  distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1 },
  byCategory: [
    { categoryId: 1, categoryName: "Iluminação", count: 1, average: 5 },
  ],
};

describe("GetDashboardIndicatorsUseCase", () => {
  it("repassa o período aos repositórios e o devolve no resultado", async () => {
    const getDashboardIndicators = jest.fn().mockResolvedValue(indicators);
    const getIndicators = jest.fn().mockResolvedValue(ratingIndicators);
    const useCase = new GetDashboardIndicatorsUseCase(
      { getDashboardIndicators } as unknown as OccurrenceRepository,
      { getIndicators } as unknown as RatingRepository
    );

    const result = await useCase.execute(period);

    expect(getDashboardIndicators).toHaveBeenCalledWith(period);
    expect(getIndicators).toHaveBeenCalledWith(period);
    expect(result).toEqual({
      ...indicators,
      period,
      ratings: ratingIndicators,
    });
  });

  it("devolve o período mesmo sem repositório de avaliações", async () => {
    const getDashboardIndicators = jest.fn().mockResolvedValue(indicators);
    const useCase = new GetDashboardIndicatorsUseCase({
      getDashboardIndicators,
    } as unknown as OccurrenceRepository);

    const result = await useCase.execute(period);

    expect(result).toEqual({ ...indicators, period });
    expect(result.ratings).toBeUndefined();
  });
});
