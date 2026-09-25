import type { DamageSeverity } from "../constants/DamageSeverity";
import type { DamageStatus } from "../constants/DamageStatus";

export interface DamageRecord {
  id: number;
  /** 病害编号，修订沿用同一编号，通过 revision 区分版本 */
  damage_no: string;
  revision: number;
  /** 修订来源：指向被更正的原始病害 */
  revised_from_id: number | null;
  relic_id: number;
  damage_type: string;
  position_desc: string;
  severity: DamageSeverity | string;
  discovered_by: string;
  discovered_at: string;
  image_url: string;
  status: DamageStatus | string;
  /** 更正原因：原病害被更正时回填 */
  corrected_reason: string | null;
  /** 原档被更正后，其后续档案保留并标记受影响；本字段用于上游病害自身的受影响标记 */
  affected: boolean;
  affected_reason: string | null;
  created_at: string;
  updated_at: string;
}
