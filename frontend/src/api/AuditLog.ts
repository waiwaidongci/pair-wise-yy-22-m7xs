import { request } from "./client";
import type { AuditLog } from "../types/AuditLog";

export const listAuditLog = () => request<AuditLog[]>("/audit-log");
