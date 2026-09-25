import type { DamageSeverity } from "../constants/DamageSeverity";

export interface DamageRecordCreatePayload {
  relic_id?: number | string;
  damage_type?: string;
  position_desc?: string;
  severity?: DamageSeverity | string;
  image_url?: string;
}

export interface DamageRecordCorrectPayload {
  damage_type?: string;
  position_desc?: string;
  severity?: DamageSeverity | string;
  image_url?: string;
  corrected_reason?: string;
}
