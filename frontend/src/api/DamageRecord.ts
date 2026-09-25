import { request } from "./client";
import type { DamageRecord } from "../types/DamageRecord";

export interface DamageRecordPayload {
  relic_id: number;
  damage_type: string;
  position_desc: string;
  severity: string;
  discovered_by?: string;
  image_url?: string;
}

export interface DamageCorrectPayload {
  damage_type?: string;
  position_desc?: string;
  severity?: string;
  image_url?: string;
  correct_reason?: string;
}

export const listDamageRecord = () => request<DamageRecord[]>("/damage-record");
export const registerDamage = (payload: DamageRecordPayload) =>
  request<DamageRecord>("/damage-record", { method: "POST", body: JSON.stringify(payload) });
export const closeDamage = (id: number) =>
  request<DamageRecord>(`/damage-record/${id}/close`, { method: "POST" });
export const correctDamage = (id: number, payload: DamageCorrectPayload) =>
  request<DamageRecord>(`/damage-record/${id}/correct`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
