import { DeleteUserUseCase } from "../../../../src/application/user/use-cases/DeleteUser";
import { createMockRepository } from "../../../helpers";
import { UserNotFoundError } from "../../../../src/domain/errors/UserNotFoundError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { User, UserRole } from "../../../../src/domain/entities/User";

const manager = new User({
  id: 1,
  name: "Carla",
  email: "carla@email.com",
  password: "hashed",
  role: UserRole.MANAGER,
});

const requester = new User({
  id: 2,
  name: "Maria",
  email: "maria@email.com",
  password: "hashed",
  role: UserRole.REQUESTER,
});

const otherRequester = new User({
  id: 3,
  name: "Carlos",
  email: "carlos@email.com",
  password: "hashed",
  role: UserRole.REQUESTER,
});

function buildRepository(users: User[]) {
  const repository = createMockRepository();
  repository.findById.mockImplementation((id: number) =>
    Promise.resolve(users.find((user) => user.id === id) ?? null)
  );
  repository.delete.mockResolvedValue(true);
  return repository;
}

describe("DeleteUserUseCase", () => {
  it("permite ao gestor excluir outro usuário", async () => {
    const repository = buildRepository([manager, otherRequester]);

    await new DeleteUserUseCase(repository).execute(3, manager.id as number);

    expect(repository.delete).toHaveBeenCalledWith(3);
  });

  it("permite ao solicitante excluir a própria conta", async () => {
    const repository = buildRepository([requester]);

    await new DeleteUserUseCase(repository).execute(2, requester.id as number);

    expect(repository.delete).toHaveBeenCalledWith(2);
  });

  it("impede o solicitante de excluir outro usuário", async () => {
    const repository = buildRepository([requester, otherRequester]);

    await expect(
      new DeleteUserUseCase(repository).execute(3, requester.id as number)
    ).rejects.toThrow(UnauthorizedError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("recusa quando o usuário autenticado não existe", async () => {
    const repository = buildRepository([otherRequester]);

    await expect(
      new DeleteUserUseCase(repository).execute(3, 999)
    ).rejects.toThrow(UnauthorizedError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("lança UserNotFoundError quando o alvo não existe", async () => {
    const repository = buildRepository([manager]);

    await expect(
      new DeleteUserUseCase(repository).execute(99, manager.id as number)
    ).rejects.toThrow(UserNotFoundError);
  });

  it("lança UserNotFoundError quando a exclusão não acontece", async () => {
    const repository = buildRepository([manager, otherRequester]);
    repository.delete.mockResolvedValue(false);

    await expect(
      new DeleteUserUseCase(repository).execute(3, manager.id as number)
    ).rejects.toThrow(UserNotFoundError);
  });
});
