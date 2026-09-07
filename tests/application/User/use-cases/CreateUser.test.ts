import { CreateUserUseCase } from "../../../../src/application/user/use-cases/CreateUser";
import { CreateUserDTO } from "../../../../src/application/user/dtos/CreateUserDTO";
import { createMockRepository } from "../../../helpers";

function createMockAuthService() {
  return {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  };
}

describe("CreateUserUseCase", () => {
  it("deve hashear password e chamar repository.create com os dados", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new CreateUserUseCase(mockRepo, mockAuth);

    const dto = CreateUserDTO.create({
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    });

    const fakeUser = {
      id: 1,
      name: dto.name,
      email: dto.email,
      password: "hashed_senha123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuth.hashPassword.mockResolvedValue("hashed_senha123");
    mockRepo.create.mockResolvedValue(fakeUser);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(mockAuth.hashPassword).toHaveBeenCalledWith(dto.password);
    expect(mockRepo.create).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      password: "hashed_senha123",
    });
    expect(result).toEqual(fakeUser);
  });

  it("deve propagar o erro quando o repositório falhar", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new CreateUserUseCase(mockRepo, mockAuth);

    const dto = CreateUserDTO.create({
      name: "João Silva",
      email: "joao@email.com",
      password: "senha123",
    });

    mockAuth.hashPassword.mockResolvedValue("hashed_senha123");
    mockRepo.create.mockRejectedValue(new Error("Erro ao criar usuário"));

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow("Erro ao criar usuário");
  });
});
