import { request } from "./client";
import type { RelicItem } from "../types/RelicItem";
import type { RelicDossier, AuditLogEntry } from "../types/Dossier";

export function listRelicItem(): Promise<RelicItem[]> {
  return request<RelicItem[]>("/relic-item");
}

export function getRelicDossier(id: number): Promise<RelicDossier> {
  return request<RelicDossier>(`/relic-item/${id}/dossier`);
}

export function createRelicItem(payload: Partial<RelicItem>): Promise<RelicItem> {
  return request<RelicItem>("/relic-item", { method: "POST", body: payload });
}

export function listAuditLogs(): Promise<AuditLogEntry[]> {
  return request<AuditLogEntry[]>("/relic-item/audit-logs");
}
