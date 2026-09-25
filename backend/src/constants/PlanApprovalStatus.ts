export const PlanApprovalStatus = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];

/** 未结束状态：同一病害只允许存在一份处于这些状态的方案 */
export const OPEN_PLAN_STATUSES: PlanApprovalStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

export const isOpenPlanStatus = (status: string): boolean =>
  (OPEN_PLAN_STATUSES as readonly string[]).includes(status);
