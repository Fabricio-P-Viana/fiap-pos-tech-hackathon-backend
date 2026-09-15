import { UserRole } from "../entities/User.ts";
import type { Occurrence } from "../entities/Occurrence.ts";
import { OccurrenceStatus, isFinalStatus } from "../enums/occurrence-status.enum.ts";

export interface Actor {
  id: number;
  role: UserRole;
}

/**
 * Regras de negócio de autorização para ocorrências, conforme REQUISITOS.md:
 * - Solicitante só acessa/edita as próprias ocorrências.
 * - Solicitante só edita/cancela enquanto a ocorrência estiver OPEN.
 * - Gestor visualiza tudo, mas só conduz (editar, mudar status, cancelar) a
 *   ocorrência da qual é o responsável: a atribuição precisa existir antes de
 *   qualquer movimentação, e a partir dela apenas aquele gestor gerencia.
 * - Ocorrência em status final (RESOLVED/CANCELLED) é histórico: não aceita
 *   edição, comentário nem anexo — somente a avaliação do solicitante.
 */
export class OccurrencePolicy {
  static isManager(actor: Actor): boolean {
    return actor.role === UserRole.MANAGER;
  }

  static isOwner(actor: Actor, occurrence: Occurrence): boolean {
    return occurrence.requesterId === actor.id;
  }

  static isAssignee(actor: Actor, occurrence: Occurrence): boolean {
    return (
      occurrence.assigneeId !== null &&
      occurrence.assigneeId !== undefined &&
      occurrence.assigneeId === actor.id
    );
  }

  static isFinal(occurrence: Occurrence): boolean {
    return isFinalStatus(occurrence.status as OccurrenceStatus);
  }

  static canView(actor: Actor, occurrence: Occurrence): boolean {
    return this.isManager(actor) || this.isOwner(actor, occurrence);
  }

  static canListAll(actor: Actor): boolean {
    return this.isManager(actor);
  }

  /**
   * Qualquer gestor pode definir ou redirecionar o responsável enquanto a
   * ocorrência estiver ativa; é o passo obrigatório antes da condução.
   */
  static canAssign(actor: Actor, occurrence: Occurrence): boolean {
    return this.isManager(actor) && !this.isFinal(occurrence);
  }

  /**
   * Condução da ocorrência (status, edição e cancelamento pelo gestor):
   * exige responsável definido e que o ator seja esse responsável.
   */
  static canManage(actor: Actor, occurrence: Occurrence): boolean {
    return (
      this.isManager(actor) &&
      !this.isFinal(occurrence) &&
      this.isAssignee(actor, occurrence)
    );
  }

  static canChangeStatus(actor: Actor, occurrence: Occurrence): boolean {
    return this.canManage(actor, occurrence);
  }

  static canEditContent(actor: Actor, occurrence: Occurrence): boolean {
    if (this.isManager(actor)) {
      return this.canManage(actor, occurrence);
    }
    return (
      this.isOwner(actor, occurrence) &&
      occurrence.status === OccurrenceStatus.OPEN
    );
  }

  static canCancel(actor: Actor, occurrence: Occurrence): boolean {
    if (this.isFinal(occurrence)) return false;
    if (this.isManager(actor)) return this.canManage(actor, occurrence);
    return (
      this.isOwner(actor, occurrence) &&
      occurrence.status === OccurrenceStatus.OPEN
    );
  }

  /**
   * Comentários e anexos acompanham o atendimento: depois de resolvida ou
   * cancelada a ocorrência vira histórico e só recebe avaliação.
   */
  static canComment(actor: Actor, occurrence: Occurrence): boolean {
    return this.canView(actor, occurrence) && !this.isFinal(occurrence);
  }

  static canAttach(actor: Actor, occurrence: Occurrence): boolean {
    return this.isOwner(actor, occurrence) && !this.isFinal(occurrence);
  }

  static canRate(actor: Actor, occurrence: Occurrence): boolean {
    return (
      this.isOwner(actor, occurrence) &&
      occurrence.status === OccurrenceStatus.RESOLVED
    );
  }

  static canViewEvents(actor: Actor, occurrence: Occurrence): boolean {
    return this.canView(actor, occurrence);
  }
}
