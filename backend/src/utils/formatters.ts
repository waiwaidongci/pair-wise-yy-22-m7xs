import { createHash } from "crypto";
import type { RestorationPlan } from "../models/RestorationPlan";
import { ERROR_CODES } from "../constants/errorCodes";
import { BusinessError } from "./BusinessError";

export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

/** 当前 ISO 时间戳，所有写操作统一走这里，便于测试 */
export const nowIso = () => new Date().toISOString();

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { hour12: false });
};

/** 渲染 constants/logTemplates 中的 {placeholder} 模板 */
export const renderTemplate = (template: string, vars: Record<string, string | number | undefined | null>): string =>
  template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    vars[key] === undefined || vars[key] === null ? "" : String(vars[key]));

/** 方案内容指纹：提交时记录，审批前若内容被修改则退回重新提交 */
export const hashPlanContent = (plan: Pick<RestorationPlan, "plan_title" | "method" | "risk_assessment">): string =>
  createHash("sha1")
    .update([plan.plan_title, plan.method, plan.risk_assessment].join(""))
    .digest("hex");

/** 方案编号沿用病害编号：BH-2026-001 → FA-2026-001-01（末两位为方案修订号） */
export const buildPlanNo = (damageNo: string, planRevision: number): string =>
  `${damageNo.replace(/^BH/, "FA")}-${String(planRevision).padStart(2, "0")}`;

/** 非空字符串校验 */
export const requireText = (value: unknown, label: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, `${label}不能为空`);
  }
  return value.trim();
};

/** 数字 id 校验 */
export const requireId = (value: unknown, label: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, `${label}格式不正确`);
  }
  return id;
};

/** 枚举值校验 */
export const requireEnum = <T extends readonly string[]>(allowed: T, value: unknown, label: string): T[number] => {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new BusinessError(
      ERROR_CODES.VALIDATION_FAILED,
      `${label}必须是 ${allowed.join(" / ")} 之一`
    );
  }
  return value as T[number];
};
