import { Login } from "../../../../src/application/auth/use-cases/Login";
import { LoginDTO } from "../../../../src/application/auth/dtos/LoginDTO";
import { createMockRepository } from "../../../helpers";
import { UserNotFoundError } from "../../../../src/domain/errors/UserNotFoundError";
import { InvalidCredentialsError } from "../../../../src/domain/errors/InvalidCredentialsError";
import { User, UserRole } from "../../../../src/domain/entities/User";

function createMockAuthService() {
  return {
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  };
}

describe("Login use case", () => {
  it("deve retornar token e dados do usuário quando credenciais forem válidas", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new Login(mockRepo, mockAuth);

    const dto = LoginDTO.create({
      email: "joao@email.com",
      password: "senha123",
    });

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed_senha123",
      role: UserRole.MANAGER,
    });

    mockRepo.findByEmail.mockResolvedValue(fakeUser);
    mockAuth.comparePasswords.mockResolvedValue(true);
    mockAuth.generateToken.mockReturnValue("fake.jwt.token");

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(mockRepo.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockAuth.comparePasswords).toHaveBeenCalledWith(
      dto.password,
      fakeUser.password,
    );
    expect(mockAuth.generateToken).toHaveBeenCalledWith(fakeUser);
    expect(result).toEqual({
      token: "fake.jwt.token",
      user: {
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        role: UserRole.MANAGER,
      },
    });
  });

  it("deve lançar UserNotFoundError quando usuário não existir", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new Login(mockRepo, mockAuth);

    const dto = LoginDTO.create({
      email: "inexistente@email.com",
      password: "senha123",
    });

    mockRepo.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(UserNotFoundError);
  });

  it("deve lançar InvalidCredentialsError quando a senha for inválida", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockAuth = createMockAuthService();
    const useCase = new Login(mockRepo, mockAuth);

    const dto = LoginDTO.create({
      email: "joao@email.com",
      password: "senhaErrada",
    });

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed_senha123",
      role: UserRole.MANAGER,
    });

    mockRepo.findByEmail.mockResolvedValue(fakeUser);
    mockAuth.comparePasswords.mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(InvalidCredentialsError);
  });
});
