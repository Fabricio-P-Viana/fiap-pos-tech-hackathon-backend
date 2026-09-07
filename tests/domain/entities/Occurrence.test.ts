import { Occurrence } from "../../../src/domain/entities/Occurrence";
import { OccurrenceStatus } from "../../../src/domain/enums/occurrence-status.enum";
import { Priority } from "../../../src/domain/enums/priority.enum";

describe("Occurrence entity", () => {
  it("deve armazenar os dados e relacionamentos", () => {
    const occurrence = new Occurrence({
      id: 1,
      requesterId: 2,
      assigneeId: 3,
      categoryId: 4,
      title: "Vazamento",
      description: "Vazamento no corredor",
      status: OccurrenceStatus.OPEN,
      priority: Priority.HIGH,
      locationText: "Bloco A",
    });
    expect(occurrence.requesterId).toBe(2);
    expect(occurrence.assigneeId).toBe(3);
    expect(occurrence.status).toBe(OccurrenceStatus.OPEN);
    expect(occurrence.priority).toBe(Priority.HIGH);
  });
});
