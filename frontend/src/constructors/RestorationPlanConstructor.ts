import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanCreatePayload, PlanUpdatePayload } from "../api/RestorationPlan";

/** 方案编制表单：从病害发起，编号沿用病害编号由后端生成 */
export const createRestorationPlanForm = (
  damageRecordId: number,
  overrides: Partial<PlanCreatePayload> = {}
): PlanCreatePayload => ({
  damage_record_id: damageRecordId,
  plan_title: "",
  method: "",
  risk_assessment: "",
  ...overrides
});

/** 方案编辑/更正表单：带出当前内容 */
export const createRestorationPlanEditForm = (
  plan: RestorationPlan,
  overrides: Partial<PlanUpdatePayload> = {}
): PlanUpdatePayload & { corrected_reason?: string } => ({
  plan_title: plan.plan_title,
  method: plan.method,
  risk_assessment: plan.risk_assessment,
  ...overrides
});

export const createRestorationPlanResponse = (row: RestorationPlan): RestorationPlan => ({ ...row });

export const createDefaultRestorationPlan = createRestorationPlanForm;
