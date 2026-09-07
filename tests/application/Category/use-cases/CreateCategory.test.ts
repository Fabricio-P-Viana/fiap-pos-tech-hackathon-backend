import { CreateCategoryUseCase } from "../../../../src/application/category/use-cases/CreateCategory";
import { CreateCategoryDTO } from "../../../../src/application/category/dtos/CreateCategoryDTO";

describe("CreateCategoryUseCase", () => {
  it("deve criar categoria ativa", async () => {
    const repository = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 1, name: "Obras", active: true }),
    } as any;
    const useCase = new CreateCategoryUseCase(repository);
    const dto = CreateCategoryDTO.create({ name: "Obras" });

    const result = await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalledWith({
      name: "Obras",
      description: undefined,
      active: true,
    });
    expect(result.id).toBe(1);
  });
});
