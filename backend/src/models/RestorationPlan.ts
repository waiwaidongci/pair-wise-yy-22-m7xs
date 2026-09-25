import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

export interface RestorationPlan {
  id: number;
  /** 方案编号：沿用病害编号，同一病害多份修订依次递增 */
  plan_no: string;
  plan_revision: number;
  relic_id: number;
  damage_record_id: number;
  /** 冗余病害编号，便于档案展示与旧档追踪 */
  damage_no: string;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: PlanApprovalStatus | string;
  /** 编制人（owner_id 保留兼容） */
  owner_id: number;
  author: string;
  /** 提交审批时的内容指纹：审批前若内容被修改，提交自动退回，审批时再做一次并发校验 */
  submitted_content_hash: string | null;
  submitted_at: string | null;
  /** 最近一次审批人 */
  reviewer: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  archived_at: string | null;
  /** 原病害或原方案被更正后，后续方案 / 步骤 / 影像保留旧档并标记受影响 */
  affected: boolean;
  affected_reason: string | null;
  /** 修订来源 */
  revised_from_id: number | null;
  /** 乐观锁：两人同时审批，后到者 expected_version 不匹配，看到已被处理 */
  version: number;
  created_at: string;
  updated_at: string;
}
