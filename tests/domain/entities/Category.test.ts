import { Category } from "../../../src/domain/entities/Category";

describe("Category entity", () => {
  it("deve armazenar os dados recebidos", () => {
    const category = new Category({
      id: 1,
      name: "Obras",
      description: "Predial",
      active: true,
    });
    expect(category).toEqual(
      expect.objectContaining({
        id: 1,
        name: "Obras",
        description: "Predial",
        active: true,
      })
    );
  });
});
