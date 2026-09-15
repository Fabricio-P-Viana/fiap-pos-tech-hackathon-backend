import { UploadOccurrenceAttachmentUseCase } from "../../../../src/application/attachment/use-cases/UploadOccurrenceAttachment";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { UserRole } from "../../../../src/domain/entities/User";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

const requester = { id: 1, role: UserRole.REQUESTER };
const manager = { id: 10, role: UserRole.MANAGER };

const input = {
  occurrenceId: 5,
  buffer: Buffer.from("imagem"),
  originalName: "foto.png",
  mimeType: "image/png",
  sizeBytes: 1024,
};

function build(status: OccurrenceStatus = OccurrenceStatus.IN_PROGRESS) {
  const occurrenceRepository = {
    findById: jest.fn().mockResolvedValue({
      id: 5,
      requesterId: requester.id,
      assigneeId: manager.id,
      status,
    }),
  } as any;
  const attachmentRepository = {
    create: jest.fn().mockResolvedValue({ id: 1, occurrenceId: 5 }),
  } as any;
  const storageService = {
    upload: jest
      .fn()
      .mockResolvedValue({ path: "occurrences/5/foto.png", url: "http://x" }),
    remove: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn(),
  } as any;

  return {
    attachmentRepository,
    storageService,
    useCase: new UploadOccurrenceAttachmentUseCase(
      attachmentRepository,
      occurrenceRepository,
      storageService
    ),
  };
}

describe("UploadOccurrenceAttachmentUseCase", () => {
  it("permite ao solicitante dono anexar imagem", async () => {
    const { attachmentRepository, storageService, useCase } = build();

    await useCase.execute(input, requester);

    expect(storageService.upload).toHaveBeenCalled();
    expect(attachmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ occurrenceId: 5, mimeType: "image/png" })
    );
  });

  it("impede o gestor, mesmo sendo o responsável", async () => {
    const { storageService, useCase } = build();

    await expect(useCase.execute(input, manager)).rejects.toThrow(
      UnauthorizedError
    );
    expect(storageService.upload).not.toHaveBeenCalled();
  });

  it("impede outro solicitante", async () => {
    const { useCase } = build();

    await expect(
      useCase.execute(input, { id: 99, role: UserRole.REQUESTER })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("recusa anexo em ocorrência encerrada", async () => {
    const { storageService, useCase } = build(OccurrenceStatus.RESOLVED);

    await expect(useCase.execute(input, requester)).rejects.toThrow(
      ValidationError
    );
    expect(storageService.upload).not.toHaveBeenCalled();
  });
});
