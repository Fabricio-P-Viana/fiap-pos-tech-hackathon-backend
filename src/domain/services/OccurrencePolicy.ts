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
 * - Gestor tem acesso amplo, exceto sobre ocorrências em status final.
 */
export class OccurrencePolicy {
  static isManager(actor: Actor): boolean {
    return actor.role === UserRole.MANAGER;
  }

  static isOwner(actor: Actor, occurrence: Occurrence): boolean {
    return occurrence.requesterId === actor.id;
  }

  static canView(actor: Actor, occurrence: Occurrence): boolean {
    return this.isManager(actor) || this.isOwner(actor, occurrence);
  }

  static canListAll(actor: Actor): boolean {
    return this.isManager(actor);
  }

  static canEditContent(actor: Actor, occurrence: Occurrence): boolean {
    if (this.isManager(actor)) {
      return !isFinalStatus(occurrence.status as OccurrenceStatus);
    }
    return (
      this.isOwner(actor, occurrence) &&
      occurrence.status === OccurrenceStatus.OPEN
    );
  }

  static canCancel(actor: Actor, occurrence: Occurrence): boolean {
    if (isFinalStatus(occurrence.status as OccurrenceStatus)) return false;
    if (this.isManager(actor)) return true;
    return (
      this.isOwner(actor, occurrence) &&
      occurrence.status === OccurrenceStatus.OPEN
    );
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
