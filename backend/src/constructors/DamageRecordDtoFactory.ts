import type { DamageRecord } from "../models/DamageRecord";

export const createDamageRecordFormDto = (
  overrides: Partial<DamageRecord> = {}
): Omit<DamageRecord, "id"> => ({
  damage_no: "",
  revision_no: 1,
  relic_id: 0,
  damage_type: "",
  position_desc: "",
  severity: "MEDIUM",
  discovered_by: "",
  discovered_at: "",
  image_url: "",
  status: "REGISTERED",
  superseded_by_id: null,
  affected: false,
  created_at: "",
  updated_at: "",
  ...overrides
});

export const createDamageRecordResponseDto = (row: DamageRecord): DamageRecord => ({ ...row });

export const createDamageRecordDto = createDamageRecordFormDto;
