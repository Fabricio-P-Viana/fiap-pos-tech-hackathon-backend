import { Priority } from "../../../src/domain/enums/priority.enum";

describe("Priority enum", () => {
  it("deve conter os níveis previstos", () => {
    expect(Object.values(Priority)).toEqual([
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ]);
  });
});
