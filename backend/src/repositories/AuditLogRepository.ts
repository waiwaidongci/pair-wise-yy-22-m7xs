import { db } from "./db";
import type { AuditLog } from "../models/AuditLog";

export const auditLogRepository = {
  findAll: (): AuditLog[] => [...db.auditLog].sort((a, b) => b.id - a.id),
  append: (row: AuditLog) => {
    db.auditLog.push(row);
    return row;
  }
};
