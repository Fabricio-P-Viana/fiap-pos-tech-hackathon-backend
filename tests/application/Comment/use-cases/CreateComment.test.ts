import { CreateCommentUseCase } from "../../../../src/application/comment/use-cases/CreateComment";
import { CreateCommentDTO } from "../../../../src/application/comment/dtos/CreateCommentDTO";
import { ResourceNotFoundError } from "../../../../src/domain/errors/ResourceNotFoundError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { UserRole } from "../../../../src/domain/entities/User";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";

describe("CreateCommentUseCase", () => {
  const dto = CreateCommentDTO.create({
    occurrenceId: 3,
    authorId: 2,
    body: "Atualização",
  });

  it("deve criar comentário quando ocorrência existir", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({ id: 3 }),
    } as any;
    const commentRepository = {
      create: jest.fn().mockResolvedValue({ id: 4, ...dto }),
    } as any;
    const result = await new CreateCommentUseCase(
      commentRepository,
      occurrenceRepository
    ).execute(dto);
    expect(commentRepository.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(4);
  });

  it("deve rejeitar ocorrência inexistente", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue(null),
    } as any;
    await expect(
      new CreateCommentUseCase({} as any, occurrenceRepository).execute(dto)
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it.each([OccurrenceStatus.RESOLVED, OccurrenceStatus.CANCELLED])(
    "deve recusar comentário em ocorrência %s",
    async (status) => {
      const occurrenceRepository = {
        findById: jest
          .fn()
          .mockResolvedValue({ id: 3, requesterId: 2, status }),
      } as any;
      const commentRepository = { create: jest.fn() } as any;

      await expect(
        new CreateCommentUseCase(
          commentRepository,
          occurrenceRepository
        ).execute(dto, UserRole.REQUESTER)
      ).rejects.toThrow("no longer accept comments");
      expect(commentRepository.create).not.toHaveBeenCalled();
    }
  );

  it("deve aceitar comentário do solicitante enquanto ativa", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 3,
        requesterId: 2,
        status: OccurrenceStatus.IN_PROGRESS,
      }),
    } as any;
    const commentRepository = {
      create: jest.fn().mockResolvedValue({ id: 4, ...dto }),
    } as any;

    await new CreateCommentUseCase(
      commentRepository,
      occurrenceRepository
    ).execute(dto, UserRole.REQUESTER);

    expect(commentRepository.create).toHaveBeenCalledWith(dto);
  });

  it("deve recusar comentário de quem não é autor nem gestor", async () => {
    const occurrenceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 3,
        requesterId: 99,
        status: OccurrenceStatus.OPEN,
      }),
    } as any;

    await expect(
      new CreateCommentUseCase({} as any, occurrenceRepository).execute(
        dto,
        UserRole.REQUESTER
      )
    ).rejects.toThrow(UnauthorizedError);
  });
});
