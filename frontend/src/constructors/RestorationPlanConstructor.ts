import type { RestorationPlan } from "../types/RestorationPlan";

export type RestorationPlanForm = Pick<RestorationPlan, "plan_title" | "method" | "risk_assessment">;

export const createDefaultRestorationPlan = (
  overrides: Partial<RestorationPlanForm> = {}
): RestorationPlanForm => ({
  plan_title: "",
  method: "",
  risk_assessment: "",
  ...overrides
});

export const createRestorationPlanForm = createDefaultRestorationPlan;
export const createRestorationPlanResponse = (row: RestorationPlan): RestorationPlan => ({ ...row });
