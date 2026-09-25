import type { StepStatus } from "../constants/StepStatus";

export interface RestorationStep {
  id: number;
  plan_id: number;
  /** 步骤序号，方案内从 1 递增 */
  step_order: number;
  technique: string;
  /** 材料记录 */
  material_used: string;
  /** 操作人（完成步骤时回写） */
  operator_id: number | null;
  operator: string | null;
  step_status: StepStatus | string;
  /** 完成时间 */
  finished_at: string | null;
  affected: boolean;
  affected_reason: string | null;
  /** 乐观锁：两人同时提交同一步骤，后到者看到该步骤已被处理 */
  version: number;
  created_at: string;
  updated_at: string;
}
