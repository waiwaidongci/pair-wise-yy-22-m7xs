import type { RestorationPlan } from "../models/RestorationPlan";

export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

export const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";

/** 审批指纹：方案提交后标题/方法/风险评估若变化，审批必须被退回。 */
export const planContentFingerprint = (plan: Pick<RestorationPlan, "plan_title" | "method" | "risk_assessment">) =>
  [plan.plan_title, plan.method, plan.risk_assessment].map((part) => part.trim()).join("");
