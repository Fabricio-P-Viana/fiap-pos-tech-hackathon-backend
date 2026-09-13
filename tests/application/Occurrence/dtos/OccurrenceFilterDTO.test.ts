import { OccurrenceFilterDTO } from "../../../../src/application/occurrence/dtos/OccurrenceFilterDTO";
import { OccurrenceStatus } from "../../../../src/domain/enums/occurrence-status.enum";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("OccurrenceFilterDTO", () => {
  it("aplica paginação padrão", () => {
    const filter = OccurrenceFilterDTO.create({});
    expect(filter.page).toBe(1);
    expect(filter.limit).toBe(20);
    expect(filter.sortBy).toBeUndefined();
  });

  it("aceita ordenação por prioridade e normaliza a direção", () => {
    const filter = OccurrenceFilterDTO.create({
      sortBy: "priority",
      sortOrder: "asc",
    });
    expect(filter.sortBy).toBe("priority");
    expect(filter.sortOrder).toBe("ASC");
  });

  it("rejeita campo de ordenação desconhecido", () => {
    expect(() => OccurrenceFilterDTO.create({ sortBy: "title" })).toThrow(
      ValidationError
    );
  });

  it("rejeita direção inválida", () => {
    expect(() =>
      OccurrenceFilterDTO.create({ sortBy: "createdAt", sortOrder: "cima" })
    ).toThrow("SortOrder must be ASC or DESC");
  });

  it("limita o tamanho de página ao teto", () => {
    expect(OccurrenceFilterDTO.create({ limit: 5000 }).limit).toBe(100);
  });

  it("valida os filtros de domínio", () => {
    expect(() => OccurrenceFilterDTO.create({ status: "ABERTO" })).toThrow(
      ValidationError
    );
    expect(
      OccurrenceFilterDTO.create({ status: OccurrenceStatus.OPEN }).status
    ).toBe(OccurrenceStatus.OPEN);
  });
});
