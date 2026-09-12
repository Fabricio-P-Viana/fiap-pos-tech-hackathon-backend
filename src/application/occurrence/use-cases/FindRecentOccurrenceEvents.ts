import type { OccurrenceEvent } from "../../../domain/entities/OccurrenceEvent.ts";
import type { OccurrenceEventRepository } from "../../../domain/repositories/OccurrenceEventRepository.ts";
import type { OccurrenceRepository } from "../../../domain/repositories/OccurrenceRepository.ts";
import type { Actor } from "../../../domain/services/OccurrencePolicy.ts";
import { OccurrencePolicy } from "../../../domain/services/OccurrencePolicy.ts";

const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 10;
/** Janela de ocorrências consideradas ao montar o resumo do solicitante. */
const SCOPE_WINDOW = 100;

export interface FindRecentOccurrenceEventsInput {
  limit?: number;
  /** Gestor: restringe aos atendimentos em que ele é o responsável. */
  assignedToMe?: boolean;
}

/**
 * Alimenta o resumo da home: os últimos acontecimentos das solicitações que o
 * usuário pode ver — as próprias, para o solicitante; todas (ou apenas as que
 * conduz), para o gestor.
 */
export class FindRecentOccurrenceEventsUseCase {
  constructor(
    private readonly occurrenceEventRepository: OccurrenceEventRepository,
    private readonly occurrenceRepository: OccurrenceRepository
  ) {}

  async execute(
    actor: Actor,
    input: FindRecentOccurrenceEventsInput = {}
  ): Promise<OccurrenceEvent[]> {
    const limit = Math.min(
      Math.max(input.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const isManager = OccurrencePolicy.isManager(actor);

    if (isManager && !input.assignedToMe) {
      return this.occurrenceEventRepository.findRecent({ limit });
    }

    const scope = await this.occurrenceRepository.findAll({
      ...(isManager ? { assigneeId: actor.id } : { requesterId: actor.id }),
      limit: SCOPE_WINDOW,
      sortBy: "updatedAt",
      sortOrder: "DESC",
    });
    const occurrenceIds = scope.data
      .map((occurrence) => occurrence.id)
      .filter((id): id is number => typeof id === "number");

    return this.occurrenceEventRepository.findRecent({ occurrenceIds, limit });
  }
}
