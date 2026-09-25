import type { DamageRecord } from "../types/DamageRecord";
import type { DamageRegisterPayload } from "../api/DamageRecord";

/** 病害登记表单默认值 */
export const createDamageRecordForm = (
  relicId: number,
  overrides: Partial<DamageRegisterPayload> = {}
): DamageRegisterPayload => ({
  relic_id: relicId,
  damage_type: "",
  position_desc: "",
  severity: "MEDIUM",
  image_url: "",
  ...overrides
});

/** 病害更正表单：默认带出最新修订版内容，必须填写更正原因 */
export const createDamageCorrectForm = (
  damage: DamageRecord,
  overrides: Partial<DamageRecord> & { corrected_reason?: string } = {}
) => ({
  damage_type: damage.damage_type,
  position_desc: damage.position_desc,
  severity: damage.severity,
  image_url: damage.image_url,
  corrected_reason: "",
  ...overrides
});

export const createDamageRecordResponse = (row: DamageRecord): DamageRecord => ({ ...row });

export const createDefaultDamageRecord = createDamageRecordForm;
