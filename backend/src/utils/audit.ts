import { auditLogRepository } from "../repositories/AuditLogRepository";
import type { Actor } from "../models/Actor";
import { nowIso, nextId } from "./ids";

export const writeAudit = (
  actor: Actor,
  action: string,
  targetType: string,
  targetId: string | number,
  detail = ""
) => {
  auditLogRepository.append({
    id: nextId(auditLogRepository.findAll()),
    actor: `${actor.name}（${actor.role}）`,
    action,
    target_type: targetType,
    target_id: String(targetId),
    detail,
    created_at: nowIso()
  });
};
