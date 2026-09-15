import { FindAllCommentUseCase } from "../../../../src/application/comment/use-cases/FindAllComment";
import { FindOneByIdCommentUseCase } from "../../../../src/application/comment/use-cases/FindOneByIdComment";
import { UserRole } from "../../../../src/domain/entities/User";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { ResourceNotFoundError } from "../../../../src/domain/errors/ResourceNotFoundError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

const owner = { id: 1, role: UserRole.REQUESTER };
const stranger = { id: 2, role: UserRole.REQUESTER };
const manager = { id: 10, role: UserRole.MANAGER };

const occurrence = { id: 5, requesterId: owner.id, status: OccurrenceStatus.IN_PROGRESS };
const publicComment = { id: 20, occurrenceId: 5, authorId: owner.id, body: "Público", isInternal: false };
const internalComment = { id: 21, occurrenceId: 5, authorId: manager.id, body: "Interno", isInternal: true };

function build() {
  const commentRepository = {
    findAll: jest.fn().mockResolvedValue([publicComment, internalComment]),
    findByOccurrenceId: jest.fn().mockResolvedValue([publicComment, internalComment]),
    findById: jest.fn().mockImplementation((id: number) =>
      Promise.resolve([publicComment, internalComment].find((c) => c.id === id) ?? null)
    ),
  } as any;
  const occurrenceRepository = {
    findById: jest.fn().mockResolvedValue(occurrence),
  } as any;
  return {
    commentRepository,
    findAll: new FindAllCommentUseCase(commentRepository, occurrenceRepository),
    findOne: new FindOneByIdCommentUseCase(commentRepository, occurrenceRepository),
  };
}

describe("FindAllCommentUseCase", () => {
  it("exige occurrenceId do solicitante", async () => {
    const { findAll, commentRepository } = build();

    await expect(findAll.execute({}, owner)).rejects.toThrow(ValidationError);
    expect(commentRepository.findAll).not.toHaveBeenCalled();
  });

  it("permite ao gestor a listagem geral", async () => {
    const { findAll, commentRepository } = build();

    const comments = await findAll.execute({}, manager);

    expect(commentRepository.findAll).toHaveBeenCalled();
    expect(comments).toHaveLength(2);
  });

  it("impede o solicitante de listar comentários de ocorrência alheia", async () => {
    const { findAll } = build();

    await expect(findAll.execute({ occurrenceId: 5 }, stranger)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("oculta comentários internos do solicitante dono", async () => {
    const { findAll } = build();

    const comments = await findAll.execute({ occurrenceId: 5 }, owner);

    expect(comments.map((c) => c.id)).toEqual([20]);
  });

  it("mostra comentários internos ao gestor", async () => {
    const { findAll } = build();

    const comments = await findAll.execute({ occurrenceId: 5 }, manager);

    expect(comments.map((c) => c.id)).toEqual([20, 21]);
  });
});

describe("FindOneByIdCommentUseCase", () => {
  it("não revela comentário interno ao solicitante", async () => {
    const { findOne } = build();

    await expect(findOne.execute(21, owner)).rejects.toThrow(ResourceNotFoundError);
  });

  it("impede leitura de comentário de ocorrência alheia", async () => {
    const { findOne } = build();

    await expect(findOne.execute(20, stranger)).rejects.toThrow(UnauthorizedError);
  });

  it("permite ao dono ler comentário público", async () => {
    const { findOne } = build();

    await expect(findOne.execute(20, owner)).resolves.toMatchObject({ id: 20 });
  });

  it("permite ao gestor ler comentário interno", async () => {
    const { findOne } = build();

    await expect(findOne.execute(21, manager)).resolves.toMatchObject({ id: 21 });
  });
});
