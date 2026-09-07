import { DeleteUserUseCase } from "../../../../src/application/user/use-cases/DeleteUser";
import { createMockRepository } from "../../../helpers";
import { UserNotFoundError } from "../../../../src/domain/errors/UserNotFoundError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { User, UserRole } from "../../../../src/domain/entities/User";

describe("DeleteUserUseCase", () => {
  it("deve deletar o usuário quando encontrado", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new DeleteUserUseCase(mockRepo);

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.delete.mockResolvedValue(true);

    // Act
    await useCase.execute(1);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar UserNotFoundError quando usuário não existir", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new DeleteUserUseCase(mockRepo);

    mockRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(99)).rejects.toThrow(UserNotFoundError);
  });

  it("deve lançar UserNotFoundError quando delete retornar false", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new DeleteUserUseCase(mockRepo);

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.delete.mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(1)).rejects.toThrow(UserNotFoundError);
  });

  it("deve permitir que aluno delete a si mesmo", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new DeleteUserUseCase(mockRepo);

    const fakeUser = new User({
      id: 2,
      name: "Maria",
      email: "maria@email.com",
      password: "hashed",
      role: UserRole.REQUESTER,
    });

    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.delete.mockResolvedValue(true);

    // Act
    await useCase.execute(2, 2);

    // Assert
    expect(mockRepo.delete).toHaveBeenCalledWith(2);
  });

  it("deve lançar UnauthorizedError quando aluno tenta deletar outro usuário", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new DeleteUserUseCase(mockRepo);

    const fakeTargetUser = new User({
      id: 3,
      name: "Carlos",
      email: "carlos@email.com",
      password: "hashed",
      role: UserRole.REQUESTER,
    });

    const fakeCurrentUser = new User({
      id: 2,
      name: "Maria",
      email: "maria@email.com",
      password: "hashed",
      role: UserRole.REQUESTER,
    });

    mockRepo.findById.mockImplementation((id: number) => {
      if (id === 3) return Promise.resolve(fakeTargetUser);
      if (id === 2) return Promise.resolve(fakeCurrentUser);
      return Promise.resolve(null);
    });

    // Act & Assert
    await expect(useCase.execute(3, 2)).rejects.toThrow(UnauthorizedError);
  });
});
