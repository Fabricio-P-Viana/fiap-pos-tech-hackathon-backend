import type {
  DashboardIndicators,
  OccurrenceRepository,
} from "../../../domain/repositories/OccurrenceRepository.ts";
import type { RatingRepository } from "../../../domain/repositories/RatingRepository.ts";

export class GetDashboardIndicatorsUseCase {
  constructor(
    private readonly occurrenceRepository: OccurrenceRepository,
    private readonly ratingRepository?: RatingRepository
  ) {}

  /**
   * Junta o volume de ocorrências com a satisfação declarada pelos
   * solicitantes — as notas são o indicador de qualidade do atendimento.
   */
  async execute(): Promise<DashboardIndicators> {
    const indicators = await this.occurrenceRepository.getDashboardIndicators();
    if (!this.ratingRepository) return indicators;

    return {
      ...indicators,
      ratings: await this.ratingRepository.getIndicators(),
    };
  }
}
