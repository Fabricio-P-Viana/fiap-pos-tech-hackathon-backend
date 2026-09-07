import { FindAllUserUseCase } from "../../../../src/application/user/use-cases/FindAllUser";
import { createMockRepository } from "../../../helpers";
import { User, UserRole } from "../../../../src/domain/entities/User";

describe("FindAllUserUseCase", () => {
  it("deve retornar todos os usuários do repositório", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new FindAllUserUseCase(mockRepo);

    const fakeUsers = [
      new User({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        password: "hashed",
        role: UserRole.MANAGER,
      }),
      new User({
        id: 2,
        name: "Maria Santos",
        email: "maria@email.com",
        password: "hashed",
        role: UserRole.REQUESTER,
      }),
    ];

    mockRepo.findAll.mockResolvedValue(fakeUsers);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeUsers);
    expect(result).toHaveLength(2);
  });

  it("deve retornar lista vazia quando não houver usuários", async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const useCase = new FindAllUserUseCase(mockRepo);

    mockRepo.findAll.mockResolvedValue([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
  });
});
