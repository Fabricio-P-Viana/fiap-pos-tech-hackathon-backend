import { FindOneByIdUserUseCase } from "../../../../src/application/user/use-cases/FindOneByIdUser";
import { createMockRepository } from "../../../helpers";
import { UserNotFoundError } from "../../../../src/domain/errors/UserNotFoundError";
import { User, UserRole } from "../../../../src/domain/entities/User";

describe("FindOneByIdUserUseCase", () => {
  it("deve retornar o usuário quando encontrado pelo id", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new FindOneByIdUserUseCase(mockRepo);

    const fakeUser = new User({
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      password: "hashed",
      role: UserRole.MANAGER,
    });

    mockRepo.findById.mockResolvedValue(fakeUser);

    // Act
    const result = await useCase.execute(1);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(fakeUser);
  });

  it("deve lançar UserNotFoundError quando usuário não existir", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new FindOneByIdUserUseCase(mockRepo);

    mockRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(99)).rejects.toThrow(UserNotFoundError);
  });
});
