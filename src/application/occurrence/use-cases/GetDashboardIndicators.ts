import type {
  DashboardIndicators,
  OccurrenceRepository,
} from "../../../domain/repositories/OccurrenceRepository.ts";

export class GetDashboardIndicatorsUseCase {
  constructor(private readonly occurrenceRepository: OccurrenceRepository) {}

  execute(): Promise<DashboardIndicators> {
    return this.occurrenceRepository.getDashboardIndicators();
  }
}
