import { CreateOccurrenceDTO } from "../../../../src/application/occurrence/dtos/CreateOccurrenceDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";
import { Priority } from "../../../../src/domain/enums/priority.enum";

describe("CreateOccurrenceDTO", () => {
  const valid = {
    requesterId: 1,
    categoryId: 2,
    title: " Vazamento ",
    description: " Há um vazamento no corredor ",
    priority: Priority.HIGH,
    latitude: -23.5,
    longitude: -46.6,
  };

  it("deve criar ocorrência com dados normalizados", () => {
    const dto = CreateOccurrenceDTO.create(valid);
    expect(dto.title).toBe("Vazamento");
    expect(dto.description).toBe("Há um vazamento no corredor");
    expect(dto.priority).toBe(Priority.HIGH);
  });

  it.each([
    { requesterId: 0 },
    { categoryId: "2" },
    { title: " " },
    { description: " " },
    { priority: "URGENT" },
    { latitude: 91 },
    { longitude: -181 },
  ])("deve rejeitar campo inválido: %p", (override) => {
    expect(() => CreateOccurrenceDTO.create({ ...valid, ...override })).toThrow(
      ValidationError
    );
  });
});
