import { CreateOccurrenceUseCase } from "../../../../src/application/occurrence/use-cases/CreateOccurrence";
import { CreateOccurrenceDTO } from "../../../../src/application/occurrence/dtos/CreateOccurrenceDTO";
import { Priority } from "../../../../src/domain/enums/priority.enum";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { OccurrenceEventType } from "../../../../src/domain/enums/occurrence-event-type.enum";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateOccurrenceUseCase", () => {
  const dto = CreateOccurrenceDTO.create({
    requesterId: 1,
    categoryId: 2,
    title: "Luz",
    description: "Lâmpada queimada",
    priority: Priority.HIGH,
  });
  const occurrence = { id: 10, ...dto, status: OccurrenceStatus.OPEN };

  it("deve criar ocorrência aberta e registrar evento", async () => {
    const occurrenceRepository = {
      create: jest.fn().mockResolvedValue(occurrence),
    } as any;
    const eventRepository = { create: jest.fn().mockResolvedValue({}) } as any;
    const categoryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 2, active: true }),
    } as any;
    const useCase = new CreateOccurrenceUseCase(
      occurrenceRepository,
      eventRepository,
      categoryRepository
    );

    const result = await useCase.execute(dto);

    expect(result).toEqual(occurrence);
    expect(occurrenceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: OccurrenceStatus.OPEN,
        priority: Priority.HIGH,
      })
    );
    expect(eventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        occurrenceId: 10,
        type: OccurrenceEventType.CREATED,
        newValue: OccurrenceStatus.OPEN,
        actorId: 1,
      })
    );
  });

  it("deve rejeitar categoria inexistente ou inativa", async () => {
    const categoryRepository = {
      findById: jest.fn().mockResolvedValue(null),
    } as any;
    const useCase = new CreateOccurrenceUseCase(
      {} as any,
      {} as any,
      categoryRepository
    );
    await expect(useCase.execute(dto)).rejects.toThrow(ValidationError);
  });
});
