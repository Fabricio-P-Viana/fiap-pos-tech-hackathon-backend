import { ChangeOccurrenceStatusUseCase } from "../../../../src/application/occurrence/use-cases/ChangeOccurrenceStatus";
import { ChangeOccurrenceStatusDTO } from "../../../../src/application/occurrence/dtos/ChangeOccurrenceStatusDTO";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { OccurrenceEventType } from "../../../../src/domain/enums/occurrence-event-type.enum";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("ChangeOccurrenceStatusUseCase", () => {
  it("deve alterar status e registrar histórico", async () => {
    const occurrenceRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({
          id: 1,
          status: OccurrenceStatus.OPEN,
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

    await useCase.execute(1, 9, dto);

    expect(occurrenceRepository.update).toHaveBeenCalledWith(1, {
      status: OccurrenceStatus.IN_ANALYSIS,
    });
    expect(eventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        occurrenceId: 1,
        type: OccurrenceEventType.STATUS_CHANGED,
        previousValue: OccurrenceStatus.OPEN,
        newValue: OccurrenceStatus.IN_ANALYSIS,
        actorId: 9,
      })
    );
  });

  it("deve rejeitar transição inválida", async () => {
    const occurrenceRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 1, status: OccurrenceStatus.OPEN }),
    } as any;
    const useCase = new ChangeOccurrenceStatusUseCase(
      occurrenceRepository,
      {} as any
    );
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.RESOLVED,
    });
    await expect(useCase.execute(1, 9, dto)).rejects.toThrow(ValidationError);
  });

  it("deve exigir resolução ao concluir", async () => {
    const occurrenceRepository = {
      findById: jest
        .fn()
        .mockResolvedValue({
          id: 1,
          status: OccurrenceStatus.IN_PROGRESS,
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
    await expect(useCase.execute(1, 9, dto)).rejects.toThrow(
      "Resolution is required"
    );
  });
});
