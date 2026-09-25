import type { RelicItem } from "./RelicItem";
import type { DamageRecord } from "./DamageRecord";
import type { RestorationPlan } from "./RestorationPlan";
import type { RestorationStep } from "./RestorationStep";
import type { ImageVersion } from "./ImageVersion";

/** 方案档案：方案 + 步骤 + 影像 + 流程动作开关 */
export interface PlanDossier extends RestorationPlan {
  steps: RestorationStep[];
  images: ImageVersion[];
  can_break_steps: boolean;
  can_upload_after: boolean;
  archive_ready: boolean;
  progress_text: string;
}

/** 文物可操作档案 */
export interface RelicDossier {
  relic: RelicItem;
  damages: DamageRecord[];
  plans: PlanDossier[];
  images: ImageVersion[];
}

export interface AuditLogEntry {
  id: number;
  actor: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}

/** 后端统一错误应答 */
export interface ApiErrorBody {
  code: string;
  message: string;
}
