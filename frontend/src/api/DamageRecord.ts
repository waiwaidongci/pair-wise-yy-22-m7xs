import { request } from "./client";
import type { DamageRecord } from "../types/DamageRecord";

export interface DamageRegisterPayload {
  relic_id: number;
  damage_type: string;
  position_desc: string;
  severity: string;
  image_url?: string;
}

export interface DamageCorrectPayload {
  damage_type?: string;
  position_desc?: string;
  severity?: string;
  image_url?: string;
  corrected_reason: string;
}

export function listDamageRecord(relicId?: number): Promise<DamageRecord[]> {
  return request<DamageRecord[]>(
    relicId !== undefined ? `/damage-record?relic_id=${relicId}` : "/damage-record"
  );
}

export function registerDamage(payload: DamageRegisterPayload): Promise<DamageRecord> {
  return request<DamageRecord>("/damage-record", { method: "POST", body: payload });
}

/** 原病害更正：旧档保留、生成修订版，下游方案/步骤/影像标记受影响 */
export function correctDamage(id: number, payload: DamageCorrectPayload): Promise<DamageRecord> {
  return request<DamageRecord>(`/damage-record/${id}/correct`, {
    method: "POST",
    body: payload
  });
}
