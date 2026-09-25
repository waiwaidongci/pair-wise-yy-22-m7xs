export interface DamageRecordPayload {
  relic_id?: number;
  damage_type?: string;
  position_desc?: string;
  severity?: string;
  discovered_by?: string;
  discovered_at?: string;
  image_url?: string;
}

export interface DamageCorrectPayload {
  damage_type?: string;
  position_desc?: string;
  severity?: string;
  image_url?: string;
  correct_reason?: string;
}
