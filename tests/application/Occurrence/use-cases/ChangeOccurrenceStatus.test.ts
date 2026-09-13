import { ChangeOccurrenceStatusUseCase } from "../../../../src/application/occurrence/use-cases/ChangeOccurrenceStatus";
import { ChangeOccurrenceStatusDTO } from "../../../../src/application/occurrence/dtos/ChangeOccurrenceStatusDTO";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { OccurrenceEventType } from "../../../../src/domain/enums/occurrence-event-type.enum";
import { UserRole } from "../../../../src/domain/entities/User";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";

const manager = { id: 9, role: UserRole.MANAGER };

describe("ChangeOccurrenceStatusUseCase", () => {
  it("deve alterar status e registrar histórico", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        status: OccurrenceStatus.OPEN,
        assigneeId: manager.id,
        resolution: null,
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 1, status: OccurrenceStatus.IN_ANALYSIS }),
    } as any;
    const eventRepository = { create: jest.fn().mockResolvedValue({}) } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      eventRepository
    );
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.IN_ANALYSIS,
      note: "Triagem",
    });

    await useCase.execute(1, manager, dto);

    expect(occurrenceRepository.update).toHaveBeenCalledWith(1, {
      status: OccurrenceStatus.IN_ANALYSIS,
    });
    expect(eventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        occurrenceId: 1,
        type: OccurrenceEventType.STATUS_CHANGED,
        previousValue: OccurrenceStatus.OPEN,
        newValue: OccurrenceStatus.IN_ANALYSIS,
        actorId: manager.id,
      })
    );
  });

  it("deve rejeitar transição inválida", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        status: OccurrenceStatus.OPEN,
        assigneeId: manager.id,
      }),
    } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      {} as any
    );
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.RESOLVED,
    });
    await expect(useCase.execute(1, manager, dto)).rejects.toThrow(
      ValidationError
    );
  });

  it("deve exigir resolução ao concluir", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        status: OccurrenceStatus.IN_PROGRESS,
        assigneeId: manager.id,
        resolution: null,
      }),
    } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      {} as any
    );
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.RESOLVED,
    });
    await expect(useCase.execute(1, manager, dto)).rejects.toThrow(
      "Resolution is required"
    );
  });

  it("deve exigir responsável definido antes de mudar o status", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        status: OccurrenceStatus.OPEN,
        assigneeId: null,
      }),
    } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      {} as any
    );
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.IN_ANALYSIS,
    });
    await expect(useCase.execute(1, manager, dto)).rejects.toThrow(
      "An assignee must be defined"
    );
  });

  it("deve impedir que outro gestor conduza a ocorrência", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        status: OccurrenceStatus.OPEN,
        assigneeId: 42,
      }),
    } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      {} as any
    );
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.IN_ANALYSIS,
    });
    await expect(useCase.execute(1, manager, dto)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("deve exigir motivo ao cancelar e registrá-lo na ocorrência", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        status: OccurrenceStatus.IN_PROGRESS,
        assigneeId: manager.id,
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 1, status: OccurrenceStatus.CANCELLED }),
    } as any;
    const eventRepository = { create: jest.fn().mockResolvedValue({}) } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      eventRepository
    );

    await expect(
      useCase.execute(
        1,
        manager,
        ChangeOccurrenceStatusDTO.create({
          status: OccurrenceStatus.CANCELLED,
        })
      )
    ).rejects.toThrow("cancellation reason");

    await useCase.execute(
      1,
      manager,
      ChangeOccurrenceStatusDTO.create({
        status: OccurrenceStatus.CANCELLED,
        note: "Duplicada da #7",
      })
    );

    expect(occurrenceRepository.update).toHaveBeenCalledWith(1, {
      status: OccurrenceStatus.CANCELLED,
      cancellationReason: "Duplicada da #7",
    });
  });
});
