import type {
  DashboardIndicators,
  DashboardPeriod,
  OccurrenceRepository,
} from "../../../domain/repositories/OccurrenceRepository.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";

export type DashboardReport = DashboardIndicators & { period: DashboardPeriod };

export class GetDashboardIndicatorsUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly ratingRepository?: RatingRepository
  ) {}

  /**
   * Junta o volume de ocorrências com a satisfação declarada pelos
   * solicitantes — as notas são o indicador de qualidade do atendimento.
   */
  async execute(period: DashboardPeriod): Promise<DashboardReport> {
    const indicators =
      await this.occurrenceRepository.getDashboardIndicators(period);
    if (!this.ratingRepository) return { ...indicators, period };

    return {
      ...indicators,
      period,
      ratings: await this.ratingRepository.getIndicators(period),
    };
  }
}
