import { FindOneByIdAttachmentUseCase } from "../../../../src/application/attachment/use-cases/FindOneByIdAttachment";
import { UpdateAttachmentUseCase } from "../../../../src/application/attachment/use-cases/UpdateAttachment";
import { DeleteAttachmentUseCase } from "../../../../src/application/attachment/use-cases/DeleteAttachment";
import { UserRole } from "../../../../src/domain/entities/User";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

const owner = { id: 1, role: UserRole.REQUESTER };
const stranger = { id: 2, role: UserRole.REQUESTER };
const manager = { id: 10, role: UserRole.MANAGER };

const attachment = {
  id: 9,
  occurrenceId: 5,
  filePath: "occurrences/5/foto.png",
  mimeType: "image/png",
  sizeBytes: 100,
};

function build(status: OccurrenceStatus = OccurrenceStatus.IN_PROGRESS) {
  const attachmentRepository = {
    findById: jest.fn().mockResolvedValue(attachment),
    update: jest.fn().mockResolvedValue({ ...attachment, mimeType: "image/webp" }),
    delete: jest.fn().mockResolvedValue(true),
  } as any;
  const occurrenceRepository = {
    findById: jest.fn().mockResolvedValue({ id: 5, requesterId: owner.id, status }),
  } as any;
  const storageService = {
    remove: jest.fn().mockResolvedValue(undefined),
  } as any;
  return {
    attachmentRepository,
    storageService,
    findOne: new FindOneByIdAttachmentUseCase(attachmentRepository, occurrenceRepository),
    update: new UpdateAttachmentUseCase(attachmentRepository, occurrenceRepository),
    remove: new DeleteAttachmentUseCase(attachmentRepository, occurrenceRepository, storageService),
  };
}

describe("FindOneByIdAttachmentUseCase", () => {
  it("permite ao dono e ao gestor ler o anexo", async () => {
    const { findOne } = build();

    await expect(findOne.execute(9, owner)).resolves.toMatchObject({ id: 9 });
    await expect(findOne.execute(9, manager)).resolves.toMatchObject({ id: 9 });
  });

  it("impede outro solicitante de ler o anexo", async () => {
    const { findOne } = build();

    await expect(findOne.execute(9, stranger)).rejects.toThrow(UnauthorizedError);
  });
});

describe("UpdateAttachmentUseCase", () => {
  it("permite ao dono atualizar enquanto ativa", async () => {
    const { update, attachmentRepository } = build();

    await update.execute(9, { mimeType: "image/webp" } as any, owner);

    expect(attachmentRepository.update).toHaveBeenCalledWith(9, { mimeType: "image/webp" });
  });

  it("impede o gestor de alterar a imagem do solicitante", async () => {
    const { update, attachmentRepository } = build();

    await expect(
      update.execute(9, { mimeType: "image/webp" } as any, manager)
    ).rejects.toThrow(UnauthorizedError);
    expect(attachmentRepository.update).not.toHaveBeenCalled();
  });

  it("impede alteração em ocorrência encerrada", async () => {
    const { update } = build(OccurrenceStatus.RESOLVED);

    await expect(
      update.execute(9, { mimeType: "image/webp" } as any, owner)
    ).rejects.toThrow(ValidationError);
  });
});

describe("DeleteAttachmentUseCase", () => {
  it("permite ao dono excluir e remove o arquivo do storage", async () => {
    const { remove, attachmentRepository, storageService } = build();

    await remove.execute(9, owner);

    expect(attachmentRepository.delete).toHaveBeenCalledWith(9);
    expect(storageService.remove).toHaveBeenCalledWith("occurrences/5/foto.png");
  });

  it("impede outro solicitante de excluir", async () => {
    const { remove, attachmentRepository, storageService } = build();

    await expect(remove.execute(9, stranger)).rejects.toThrow(UnauthorizedError);
    expect(attachmentRepository.delete).not.toHaveBeenCalled();
    expect(storageService.remove).not.toHaveBeenCalled();
  });

  it("preserva as imagens de ocorrência encerrada", async () => {
    const { remove, attachmentRepository } = build(OccurrenceStatus.CANCELLED);

    await expect(remove.execute(9, owner)).rejects.toThrow(ValidationError);
    expect(attachmentRepository.delete).not.toHaveBeenCalled();
  });
});
