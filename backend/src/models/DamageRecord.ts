import type { DamageStatus } from "../constants/DamageStatus";

export interface DamageRecord {
  id: number;
  damage_no: string;
  revision_no: number;
  relic_id: number;
  damage_type: string;
  position_desc: string;
  severity: string;
  discovered_by: string;
  discovered_at: string;
  image_url: string;
  status: DamageStatus;
  superseded_by_id: number | null;
  affected: boolean;
  created_at: string;
  updated_at: string;
}
