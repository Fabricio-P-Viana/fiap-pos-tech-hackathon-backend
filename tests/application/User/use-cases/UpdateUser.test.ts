import { UpdateUserUseCase } from "../../../../src/application/user/use-cases/UpdateUser";
import { UpdateUserDTO } from "../../../../src/application/user/dtos/UpdateUserDTO";
import { createMockRepository } from "../../../helpers";
import { UserNotFoundError } from "../../../../src/domain/errors/UserNotFoundError";
import { UnauthorizedError } from "../../../../src/domain/errors/UnauthorizedError";
import { User, UserRole } from "../../../../src/domain/entities/User";

function createMockAuthService() {
  return {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  };
}

describe("UpdateUserUseCase", () => {
  it("deve atualizar o usuário quando encontrado", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new UpdateUserUseCase(mockRepo, mockAuth);

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    const dto = UpdateUserDTO.create({ name: "João Atualizado" });

    const fakeUpdated = new User({
      id: 1,
      name: "João Atualizado",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.update.mockResolvedValue(fakeUpdated);

    // Act
    const result = await useCase.execute(1, dto);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      name: "João Atualizado",
    });
    expect(result).toEqual(fakeUpdated);
  });

  it("deve hashear a senha quando password for fornecido no DTO", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new UpdateUserUseCase(mockRepo, mockAuth);

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    const dto = UpdateUserDTO.create({ password: "novaSenha123" });

    const fakeUpdated = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed_novaSenha",
      role: UserRole.MANAGER,
    });

    mockAuth.hashPassword.mockResolvedValue("hashed_novaSenha");
    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.update.mockResolvedValue(fakeUpdated);

    // Act
    const result = await useCase.execute(1, dto);

    // Assert
    expect(mockAuth.hashPassword).toHaveBeenCalledWith("novaSenha123");
    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      password: "hashed_novaSenha",
    });
    expect(result).toEqual(fakeUpdated);
  });

  it("deve lançar UserNotFoundError quando usuário não existir", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new UpdateUserUseCase(mockRepo, mockAuth);

    const dto = UpdateUserDTO.create({ name: "Novo Nome" });

    mockRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(99, dto)).rejects.toThrow(UserNotFoundError);
  });

  it("deve lançar UserNotFoundError quando update retornar null", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new UpdateUserUseCase(mockRepo, mockAuth);

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    const dto = UpdateUserDTO.create({ name: "Novo Nome" });

    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.update.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(1, dto)).rejects.toThrow(UserNotFoundError);
  });

  it("deve permitir que aluno atualize a si mesmo", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new UpdateUserUseCase(mockRepo, mockAuth);

    const fakeUser = new User({
      id: 2,
      name: "Maria",
      email: "maria@email.com",
      password: "hashed",
      role: UserRole.REQUESTER,
    });

    const fakeUpdated = new User({
      id: 2,
      name: "Nome Alterado",
      email: "maria@email.com",
      password: "hashed",
      role: UserRole.REQUESTER,
    });

    const dto = UpdateUserDTO.create({ name: "Nome Alterado" });

    mockRepo.findById.mockResolvedValue(fakeUser);
    mockRepo.update.mockResolvedValue(fakeUpdated);

    // Act
    const result = await useCase.execute(2, dto, 2);

    // Assert
    expect(result).toEqual(fakeUpdated);
  });

  it("deve lançar UnauthorizedError quando aluno tentar atualizar outro usuário", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new UpdateUserUseCase(mockRepo, mockAuth);

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

    const dto = UpdateUserDTO.create({ name: "Nome Alterado" });

    mockRepo.findById.mockImplementation((id: number) => {
      if (id === 3) return Promise.resolve(fakeTargetUser);
      if (id === 2) return Promise.resolve(fakeCurrentUser);
      return Promise.resolve(null);
    });

    // Act & Assert
    await expect(useCase.execute(3, dto, 2)).rejects.toThrow(UnauthorizedError);
  });
});
