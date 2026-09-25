import { auditLogRepository } from "../repositories/AuditLogRepository";
import type { InMemoryDatabase } from "../database/inMemoryDb";
import type { AuthUser } from "../types/AuthUser";
import { nowIso, renderTemplate, toAuditTarget } from "../utils/formatters";

/**
 * 操作日志：方案审批、影像归档、病害关闭/更正等全部写操作都经此记录。
 * 日志模板集中在 constants/logTemplates.ts，字段变更时必须同步模板与调用处。
 */
export const auditService = {
  record(
    actor: AuthUser,
    action: string,
    targetType: string,
    targetId: string | number,
    template: string,
    vars: Record<string, string | number | undefined | null>,
    context?: InMemoryDatabase
  ) {
    const detail = renderTemplate(template, vars);
    return auditLogRepository.insert(
      {
        actor: actor.name,
        actor_role: actor.role,
        action,
        target_type: targetType,
        target_id: toAuditTarget(targetType, targetId),
        detail,
        created_at: nowIso()
      },
      context
    );
  },

  list() {
    return auditLogRepository.findAll();
  }
};
