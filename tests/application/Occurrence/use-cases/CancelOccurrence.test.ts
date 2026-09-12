import { CancelOccurrenceUseCase } from "../../../../src/application/occurrence/use-cases/CancelOccurrence";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { OccurrenceEventType } from "../../../../src/domain/enums/occurrence-event-type.enum";
import { UserRole } from "../../../../src/domain/entities/User";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";

const requester = { id: 1, role: UserRole.REQUESTER };
const assignedManager = { id: 10, role: UserRole.MANAGER };

function buildRepositories(occurrence: Record<string, unknown>) {
  const occurrenceRepository = {
    findById: jest.fn().mockResolvedValue(occurrence),
    update: jest
      .fn()
      .mockResolvedValue({ ...occurrence, status: OccurrenceStatus.CANCELLED }),
  } as any;
  const eventRepository = { create: jest.fn().mockResolvedValue({}) } as any;
  return { occurrenceRepository, eventRepository };
}

describe("CancelOccurrenceUseCase", () => {
  it("exige motivo do cancelamento", async () => {
    const { occurrenceRepository, eventRepository } = buildRepositories({
      id: 1,
      requesterId: requester.id,
      status: OccurrenceStatus.OPEN,
      assigneeId: null,
    });
    const useCase = new CancelOccurrenceUseCase(
      occurrenceRepository,
      eventRepository
    );

    await expect(useCase.execute(1, requester)).rejects.toThrow(
      "A cancellation reason is required"
    );
    await expect(useCase.execute(1, requester, "   ")).rejects.toThrow(
      "A cancellation reason is required"
    );
    expect(occurrenceRepository.update).not.toHaveBeenCalled();
  });

  it("persiste o motivo na ocorrência e no histórico", async () => {
    const { occurrenceRepository, eventRepository } = buildRepositories({
      id: 1,
      requesterId: requester.id,
      status: OccurrenceStatus.OPEN,
      assigneeId: null,
    });
    const useCase = new CancelOccurrenceUseCase(
      occurrenceRepository,
      eventRepository
    );

    await useCase.execute(1, requester, "  Resolvido pelo zelador  ");

    expect(occurrenceRepository.update).toHaveBeenCalledWith(1, {
      status: OccurrenceStatus.CANCELLED,
      cancellationReason: "Resolvido pelo zelador",
    });
    expect(eventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: OccurrenceEventType.STATUS_CHANGED,
        newValue: OccurrenceStatus.CANCELLED,
        note: "Resolvido pelo zelador",
        actorId: requester.id,
      })
    );
  });

  it("impede gestor que não é o responsável", async () => {
    const { occurrenceRepository, eventRepository } = buildRepositories({
      id: 1,
      requesterId: requester.id,
      status: OccurrenceStatus.IN_PROGRESS,
      assigneeId: 99,
    });
    const useCase = new CancelOccurrenceUseCase(
      occurrenceRepository,
      eventRepository
    );

    await expect(
      useCase.execute(1, assignedManager, "Sem procedência")
    ).rejects.toThrow(UnauthorizedError);
  });

  it("rejeita ocorrência já encerrada", async () => {
    const { occurrenceRepository, eventRepository } = buildRepositories({
      id: 1,
      requesterId: requester.id,
      status: OccurrenceStatus.RESOLVED,
      assigneeId: assignedManager.id,
    });
    const useCase = new CancelOccurrenceUseCase(
      occurrenceRepository,
      eventRepository
    );

    await expect(
      useCase.execute(1, assignedManager, "Qualquer motivo")
    ).rejects.toThrow("final status");
  });
});
