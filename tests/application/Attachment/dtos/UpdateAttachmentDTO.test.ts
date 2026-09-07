import { UpdateAttachmentDTO } from "../../../../src/application/attachment/dtos/UpdateAttachmentDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("UpdateAttachmentDTO", () => {
  it("deve aceitar atualização parcial", () => {
    const dto = UpdateAttachmentDTO.create({
      mimeType: " image/jpeg ",
      sizeBytes: 100,
    });
    expect(dto.mimeType).toBe("image/jpeg");
    expect(dto.sizeBytes).toBe(100);
  });

  it.each([{}, { filePath: "" }, { sizeBytes: 0 }])(
    "deve rejeitar dados inválidos: %p",
    (data) =>
      expect(() => UpdateAttachmentDTO.create(data)).toThrow(ValidationError)
  );
});
