import { CreateAttachmentDTO } from "../../../../src/application/attachment/dtos/CreateAttachmentDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateAttachmentDTO", () => {
  it("deve criar anexo válido", () => {
    const dto = CreateAttachmentDTO.create({
      occurrenceId: 1,
      filePath: " /tmp/a.png ",
      mimeType: " image/png ",
      sizeBytes: 10,
    });
    expect(dto.filePath).toBe("/tmp/a.png");
    expect(dto.mimeType).toBe("image/png");
  });

  it.each([
    { occurrenceId: 0 },
    { filePath: "" },
    { mimeType: 1 },
    { sizeBytes: 0 },
  ])("deve rejeitar dados inválidos: %p", (override) =>
    expect(() =>
      CreateAttachmentDTO.create({
        occurrenceId: 1,
        filePath: "a",
        mimeType: "text/plain",
        sizeBytes: 1,
        ...override,
      })
    ).toThrow(ValidationError)
  );
});
