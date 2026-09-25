export type DamageStatusValue = "REGISTERED" | "TREATING" | "CLOSED" | "CORRECTED";

export interface DamageRecord {
  id: number;
  damage_no: string;
  revision: number;
  revised_from_id: number | null;
  relic_id: number;
  damage_type: string;
  position_desc: string;
  severity: string;
  discovered_by: string;
  discovered_at: string;
  image_url: string;
  status: DamageStatusValue | string;
  corrected_reason: string | null;
  affected: boolean;
  affected_reason: string | null;
  created_at: string;
  updated_at: string;
  /** 档案接口聚合字段 */
  plan_count?: number;
  can_create_plan?: boolean;
}
