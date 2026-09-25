import { STATUS_TEXT } from "../constants/statusText";

export const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { hour12: false });
};

/** 统一状态文案：枚举值在各 *Text 映射中集中维护 */
export const formatStatus = (value: string): string => {
  for (const map of Object.values(STATUS_TEXT)) {
    if (value in map) return (map as Record<string, string>)[value];
  }
  return value.replace(/_/g, " ");
};

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

/** 风险/严重程度等级文案（DamageSeverity） */
export const formatRisk = (value: string): string =>
  ({ LOW: "轻度", MEDIUM: "中度", HIGH: "重度", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

/** 影像类型文案 */
export const formatImageType = (value: string): string =>
  ({ BEFORE: "修复前", AFTER: "修复后" }[value] ?? value);

/** 方案流程进度：已完成步骤数 / 总步骤数 */
export const formatProgress = (finished: number, total: number): string => `${finished}/${total}`;
