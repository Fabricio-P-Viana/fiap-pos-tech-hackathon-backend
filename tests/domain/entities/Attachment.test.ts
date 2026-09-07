import { Attachment } from "../../../src/domain/entities/Attachment";

describe("Attachment entity", () => {
  it("deve armazenar os metadados do arquivo", () => {
    const attachment = new Attachment({
      occurrenceId: 1,
      filePath: "a.png",
      mimeType: "image/png",
      sizeBytes: 100,
    });
    expect(attachment.occurrenceId).toBe(1);
    expect(attachment.filePath).toBe("a.png");
    expect(attachment.mimeType).toBe("image/png");
    expect(attachment.sizeBytes).toBe(100);
  });
});
