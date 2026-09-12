import { OccurrencePolicy } from "../../../src/domain/services/OccurrencePolicy";
import { UserRole } from "../../../src/domain/entities/User";
import { Occurrence } from "../../../src/domain/entities/Occurrence";
import { OccurrenceStatus } from "../../../src/domain/enums/occurrence-status.enum";
import { Priority } from "../../../src/domain/enums/priority.enum";

const requester = { id: 1, role: UserRole.REQUESTER };
const assignedManager = { id: 10, role: UserRole.MANAGER };
const otherManager = { id: 11, role: UserRole.MANAGER };

function buildOccurrence(overrides: Partial<Occurrence> = {}): Occurrence {
  return new Occurrence({
    id: 5,
    requesterId: requester.id,
    assigneeId: assignedManager.id,
    categoryId: 2,
    title: "Vazamento",
    description: "Corredor alagado",
    status: OccurrenceStatus.IN_ANALYSIS,
    priority: Priority.MEDIUM,
    ...overrides,
  });
}

describe("OccurrencePolicy", () => {
  describe("condução pelo gestor", () => {
    it("exige responsável definido", () => {
      const occurrence = buildOccurrence({ assigneeId: null });
      expect(OccurrencePolicy.canManage(assignedManager, occurrence)).toBe(
        false
      );
      expect(OccurrencePolicy.canChangeStatus(otherManager, occurrence)).toBe(
        false
      );
      expect(OccurrencePolicy.canAssign(otherManager, occurrence)).toBe(true);
    });

    it("permite apenas ao gestor responsável", () => {
      const occurrence = buildOccurrence();
      expect(OccurrencePolicy.canManage(assignedManager, occurrence)).toBe(true);
      expect(OccurrencePolicy.canManage(otherManager, occurrence)).toBe(false);
      expect(OccurrencePolicy.canEditContent(otherManager, occurrence)).toBe(
        false
      );
      expect(OccurrencePolicy.canCancel(otherManager, occurrence)).toBe(false);
    });

    it("bloqueia condução em status final", () => {
      const resolved = buildOccurrence({ status: OccurrenceStatus.RESOLVED });
      expect(OccurrencePolicy.canManage(assignedManager, resolved)).toBe(false);
      expect(OccurrencePolicy.canAssign(assignedManager, resolved)).toBe(false);
    });
  });

  describe("solicitante", () => {
    it("edita e cancela apenas a própria ocorrência em OPEN", () => {
      const open = buildOccurrence({ status: OccurrenceStatus.OPEN });
      expect(OccurrencePolicy.canEditContent(requester, open)).toBe(true);
      expect(OccurrencePolicy.canCancel(requester, open)).toBe(true);

      const inAnalysis = buildOccurrence();
      expect(OccurrencePolicy.canEditContent(requester, inAnalysis)).toBe(false);
      expect(OccurrencePolicy.canCancel(requester, inAnalysis)).toBe(false);

      const fromOthers = buildOccurrence({
        requesterId: 99,
        status: OccurrenceStatus.OPEN,
      });
      expect(OccurrencePolicy.canView(requester, fromOthers)).toBe(false);
      expect(OccurrencePolicy.canEditContent(requester, fromOthers)).toBe(false);
    });

    it("avalia somente ocorrência própria resolvida", () => {
      expect(
        OccurrencePolicy.canRate(
          requester,
          buildOccurrence({ status: OccurrenceStatus.RESOLVED })
        )
      ).toBe(true);
      expect(OccurrencePolicy.canRate(requester, buildOccurrence())).toBe(false);
    });
  });

  describe("histórico após encerramento", () => {
    it.each([OccurrenceStatus.RESOLVED, OccurrenceStatus.CANCELLED])(
      "não aceita comentário nem anexo em %s",
      (status) => {
        const occurrence = buildOccurrence({ status });
        expect(OccurrencePolicy.canComment(requester, occurrence)).toBe(false);
        expect(OccurrencePolicy.canComment(assignedManager, occurrence)).toBe(
          false
        );
        expect(OccurrencePolicy.canAttach(requester, occurrence)).toBe(false);
        expect(OccurrencePolicy.canAttach(assignedManager, occurrence)).toBe(
          false
        );
      }
    );

    it("aceita comentário e anexo enquanto ativa", () => {
      const occurrence = buildOccurrence();
      expect(OccurrencePolicy.canComment(requester, occurrence)).toBe(true);
      expect(OccurrencePolicy.canAttach(assignedManager, occurrence)).toBe(true);
    });
  });
});
