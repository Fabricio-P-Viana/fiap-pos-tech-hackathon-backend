import { CreateCategoryDTO } from "../../../../src/application/category/dtos/CreateCategoryDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateCategoryDTO", () => {
  it("deve normalizar dados válidos", () => {
    const dto = CreateCategoryDTO.create({
      name: " Manutenção ",
      description: " Predial ",
    });
    expect(dto).toEqual(
      expect.objectContaining({ name: "Manutenção", description: "Predial" })
    );
  });

  it.each([{}, { name: " " }, { name: 1 }, { name: "Obras", description: 1 }])(
    "deve rejeitar dados inválidos: %p",
    (data) =>
      expect(() => CreateCategoryDTO.create(data)).toThrow(ValidationError)
  );
});
