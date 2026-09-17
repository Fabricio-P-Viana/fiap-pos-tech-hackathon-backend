import { DashboardPeriodDTO } from "../../../../src/application/occurrence/dtos/DashboardPeriodDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-09-15T12:00:00.000Z");

describe("DashboardPeriodDTO", () => {
  it("usa os últimos 30 dias quando nenhuma data é informada", () => {
    const period = DashboardPeriodDTO.create({}, now);
    expect(period.to).toEqual(now);
    expect(period.from).toEqual(new Date(now.getTime() - 30 * DAY_MS));
  });

  it("completa o fim a partir do início", () => {
    const period = DashboardPeriodDTO.create(
      { from: "2026-08-01T00:00:00.000Z" },
      now
    );
    expect(period.from).toEqual(new Date("2026-08-01T00:00:00.000Z"));
    expect(period.to).toEqual(new Date("2026-08-31T00:00:00.000Z"));
  });

  it("completa o início a partir do fim", () => {
    const period = DashboardPeriodDTO.create(
      { to: "2026-08-31T00:00:00.000Z" },
      now
    );
    expect(period.from).toEqual(new Date("2026-08-01T00:00:00.000Z"));
    expect(period.to).toEqual(new Date("2026-08-31T00:00:00.000Z"));
  });

  it("aceita um período de exatamente 30 dias", () => {
    const period = DashboardPeriodDTO.create(
      { from: "2026-08-01T03:00:00.000Z", to: "2026-08-31T03:00:00.000Z" },
      now
    );
    expect(period.from).toEqual(new Date("2026-08-01T03:00:00.000Z"));
    expect(period.to).toEqual(new Date("2026-08-31T03:00:00.000Z"));
  });

  it("rejeita período maior que 30 dias", () => {
    expect(() =>
      DashboardPeriodDTO.create(
        { from: "2026-08-01T00:00:00.000Z", to: "2026-08-31T00:00:00.001Z" },
        now
      )
    ).toThrow("Dashboard period cannot exceed 30 days");
  });

  it("rejeita início posterior ao fim", () => {
    expect(() =>
      DashboardPeriodDTO.create(
        { from: "2026-08-10T00:00:00.000Z", to: "2026-08-01T00:00:00.000Z" },
        now
      )
    ).toThrow("from must be earlier than to");
  });

  it("rejeita datas inválidas", () => {
    expect(() => DashboardPeriodDTO.create({ from: "ontem" }, now)).toThrow(
      ValidationError
    );
  });
});
