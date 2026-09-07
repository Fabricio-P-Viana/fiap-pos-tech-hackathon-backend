import { ChangeOccurrenceStatusDTO } from "../../../../src/application/occurrence/dtos/ChangeOccurrenceStatusDTO";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("ChangeOccurrenceStatusDTO", () => {
  it("deve aceitar status e observação", () => {
    const dto = ChangeOccurrenceStatusDTO.create({
      status: OccurrenceStatus.IN_ANALYSIS,
      note: " Analisando ",
    });
    expect(dto.status).toBe(OccurrenceStatus.IN_ANALYSIS);
    expect(dto.note).toBe("Analisando");
  });

  it("deve rejeitar status inválido", () => {
    expect(() => ChangeOccurrenceStatusDTO.create({ status: "DONE" })).toThrow(
      ValidationError
    );
  });

  it("deve rejeitar observação vazia", () => {
    expect(() =>
      ChangeOccurrenceStatusDTO.create({
        status: OccurrenceStatus.CANCELLED,
        note: " ",
      })
    ).toThrow(ValidationError);
  });
});
