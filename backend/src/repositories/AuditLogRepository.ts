import { db, type InMemoryDatabase } from "../database/inMemoryDb";
import type { AuditLog } from "../models/AuditLog";

class AuditLogRepository {
  findAll(context: InMemoryDatabase = db): AuditLog[] {
    return context.auditLogs;
  }

  insert(row: Omit<AuditLog, "id">, context: InMemoryDatabase = db): AuditLog {
    const record: AuditLog = { ...row, id: context.nextId("auditLogs") };
    context.auditLogs.push(record);
    return record;
  }
}

export const auditLogRepository = new AuditLogRepository();
