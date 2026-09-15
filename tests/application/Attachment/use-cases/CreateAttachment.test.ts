import { CreateAttachmentUseCase } from "../../../../src/application/attachment/use-cases/CreateAttachment";
import { CreateAttachmentDTO } from "../../../../src/application/attachment/dtos/CreateAttachmentDTO";
import { UserRole } from "../../../../src/domain/entities/User";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { ResourceNotFoundError } from "../../../../src/domain/errors/ResourceNotFoundError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

const owner = { id: 1, role: UserRole.REQUESTER };

const dto = CreateAttachmentDTO.create({
  occurrenceId: 1,
  filePath: "a.png",
  mimeType: "image/png",
  sizeBytes: 20,
});

function build(occurrence: Record<string, unknown> | null) {
  const occurrenceRepository = {
    findById: jest.fn().mockResolvedValue(occurrence),
  } as any;
  const attachmentRepository = {
    create: jest.fn().mockResolvedValue({ id: 2, ...dto }),
  } as any;
  return {
    attachmentRepository,
    useCase: new CreateAttachmentUseCase(attachmentRepository, occurrenceRepository),
  };
}

describe("CreateAttachmentUseCase", () => {
  it("cria anexo para o solicitante dono de ocorrência ativa", async () => {
    const { attachmentRepository, useCase } = build({
      id: 1,
      requesterId: owner.id,
      status: OccurrenceStatus.OPEN,
    });

    await useCase.execute(dto, owner);

    expect(attachmentRepository.create).toHaveBeenCalledWith(dto);
  });

  it("rejeita ocorrência inexistente", async () => {
    const { useCase } = build(null);

    await expect(useCase.execute(dto, owner)).rejects.toThrow(ResourceNotFoundError);
  });

  it("impede anexo em ocorrência de outra pessoa", async () => {
    const { attachmentRepository, useCase } = build({
      id: 1,
      requesterId: 99,
      status: OccurrenceStatus.OPEN,
    });

    await expect(useCase.execute(dto, owner)).rejects.toThrow(UnauthorizedError);
    expect(attachmentRepository.create).not.toHaveBeenCalled();
  });

  it("impede anexo em ocorrência encerrada", async () => {
    const { attachmentRepository, useCase } = build({
      id: 1,
      requesterId: owner.id,
      status: OccurrenceStatus.RESOLVED,
    });

    await expect(useCase.execute(dto, owner)).rejects.toThrow(ValidationError);
    expect(attachmentRepository.create).not.toHaveBeenCalled();
  });
});
