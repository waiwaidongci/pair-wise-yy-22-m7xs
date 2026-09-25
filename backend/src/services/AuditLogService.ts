import { auditLogRepository } from "../repositories/AuditLogRepository";

export const auditLogService = {
  list: () => auditLogRepository.findAll()
};
