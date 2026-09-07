import { UpdateOccurrenceDTO } from "../../../../src/application/occurrence/dtos/UpdateOccurrenceDTO";
import { Priority } from "../../../../src/domain/enums/priority.enum";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("UpdateOccurrenceDTO", () => {
  it("deve aceitar atualização parcial", () => {
    const dto = UpdateOccurrenceDTO.create({
      priority: Priority.CRITICAL,
      resolution: " Resolvido ",
    });
    expect(dto.priority).toBe(Priority.CRITICAL);
    expect(dto.resolution).toBe("Resolvido");
  });

  it.each([
    {},
    { priority: "URGENT" },
    { categoryId: 0 },
    { latitude: 91 },
    { resolution: 10 },
  ])("deve rejeitar dados inválidos: %p", (data) =>
    expect(() => UpdateOccurrenceDTO.create(data)).toThrow(ValidationError)
  );
});
