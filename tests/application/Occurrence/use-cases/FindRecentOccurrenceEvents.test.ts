import { FindRecentOccurrenceEventsUseCase } from "../../../../src/application/occurrence/use-cases/FindRecentOccurrenceEvents";
import { UserRole } from "../../../../src/domain/entities/User";

const requester = { id: 7, role: UserRole.REQUESTER };
const manager = { id: 3, role: UserRole.MANAGER };

function build(occurrences: Array<{ id: number }> = []) {
  const eventRepository = {
    findRecent: jest.fn().mockResolvedValue([]),
  } as any;
  const occurrenceRepository = {
    findAll: jest.fn().mockResolvedValue({ data: occurrences }),
  } as any;
  return {
    eventRepository,
    occurrenceRepository,
    useCase: new FindRecentOccurrenceEventsUseCase(
      eventRepository,
      occurrenceRepository
    ),
  };
}

describe("FindRecentOccurrenceEventsUseCase", () => {
  it("limita o solicitante às próprias solicitações", async () => {
    const { eventRepository, occurrenceRepository, useCase } = build([
      { id: 11 },
      { id: 12 },
    ]);

    await useCase.execute(requester, { limit: 5 });

    expect(occurrenceRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ requesterId: requester.id })
    );
    expect(eventRepository.findRecent).toHaveBeenCalledWith({
      occurrenceIds: [11, 12],
      limit: 5,
    });
  });

  it("não vaza eventos quando o solicitante não tem solicitações", async () => {
    const { eventRepository, useCase } = build([]);

    await useCase.execute(requester);

    expect(eventRepository.findRecent).toHaveBeenCalledWith({
      occurrenceIds: [],
      limit: 10,
    });
  });

  it("dá ao gestor a visão geral da operação", async () => {
    const { eventRepository, occurrenceRepository, useCase } = build();

    await useCase.execute(manager);

    expect(occurrenceRepository.findAll).not.toHaveBeenCalled();
    expect(eventRepository.findRecent).toHaveBeenCalledWith({ limit: 10 });
  });

  it("restringe o gestor aos atendimentos que conduz quando pedido", async () => {
    const { eventRepository, occurrenceRepository, useCase } = build([
      { id: 21 },
    ]);

    await useCase.execute(manager, { assignedToMe: true });

    expect(occurrenceRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ assigneeId: manager.id })
    );
    expect(eventRepository.findRecent).toHaveBeenCalledWith({
      occurrenceIds: [21],
      limit: 10,
    });
  });

  it("respeita o teto de itens", async () => {
    const { eventRepository, useCase } = build();

    await useCase.execute(manager, { limit: 500 });

    expect(eventRepository.findRecent).toHaveBeenCalledWith({ limit: 30 });
  });
});
