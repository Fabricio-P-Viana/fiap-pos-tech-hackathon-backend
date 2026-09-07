import { UpdateCategoryDTO } from "../../../../src/application/category/dtos/UpdateCategoryDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("UpdateCategoryDTO", () => {
  it("deve aceitar atualização parcial", () => {
    expect(
      UpdateCategoryDTO.create({ name: " Nova categoria ", active: false })
    ).toEqual(
      expect.objectContaining({ name: "Nova categoria", active: false })
    );
  });

  it("deve exigir ao menos um campo", () => {
    expect(() => UpdateCategoryDTO.create({})).toThrow(ValidationError);
  });

  it("deve validar active", () => {
    expect(() => UpdateCategoryDTO.create({ active: "false" })).toThrow(
      ValidationError
    );
  });
});
