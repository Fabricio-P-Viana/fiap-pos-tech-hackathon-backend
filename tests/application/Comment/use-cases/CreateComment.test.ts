import { CreateCommentUseCase } from "../../../../src/application/comment/use-cases/CreateComment";
import { CreateCommentDTO } from "../../../../src/application/comment/dtos/CreateCommentDTO";
import { ResourceNotFoundError } from "../../../../src/domain/errors/ResourceNotFoundError";

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
});
