import type { DamageRecord } from "../types/DamageRecord";

export type DamageRecordForm = Omit<
  DamageRecord,
  "id" | "damage_no" | "revision_no" | "status" | "superseded_by_id" | "affected" | "created_at" | "updated_at"
>;

export const createDefaultDamageRecord = (overrides: Partial<DamageRecordForm> = {}): DamageRecordForm => ({
  relic_id: 0,
  damage_type: "",
  position_desc: "",
  severity: "MEDIUM",
  discovered_by: "",
  discovered_at: "",
  image_url: "",
  ...overrides
});

export const createDamageRecordForm = createDefaultDamageRecord;
export const createDamageRecordResponse = (row: DamageRecord): DamageRecord => ({ ...row });
