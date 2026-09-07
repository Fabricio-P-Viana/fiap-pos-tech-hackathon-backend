import { CreateAttachmentUseCase } from "../../../../src/application/attachment/use-cases/CreateAttachment";
import { CreateAttachmentDTO } from "../../../../src/application/attachment/dtos/CreateAttachmentDTO";
import { ResourceNotFoundError } from "../../../../src/domain/errors/ResourceNotFoundError";

describe("CreateAttachmentUseCase", () => {
  it("deve criar anexo para ocorrência existente", async () => {
    const dto = CreateAttachmentDTO.create({
      occurrenceId: 1,
      filePath: "a.png",
      mimeType: "image/png",
      sizeBytes: 20,
    });
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const attachmentRepository = {
      create: jest.fn().mockResolvedValue({ id: 2, ...dto }),
    } as any;
    await new CreateAttachmentUseCase(
      attachmentRepository,
      occurrenceRepository
    ).execute(dto);
    expect(attachmentRepository.create).toHaveBeenCalledWith(dto);
  });

  it("deve rejeitar ocorrência inexistente", async () => {
    const dto = CreateAttachmentDTO.create({
      occurrenceId: 1,
      filePath: "a.png",
      mimeType: "image/png",
      sizeBytes: 20,
    });
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue(null),
    } as any;
    await expect(
      new CreateAttachmentUseCase({} as any, occurrenceRepository).execute(dto)
    ).rejects.toThrow(ResourceNotFoundError);
  });
});
