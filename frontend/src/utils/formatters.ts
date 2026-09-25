import { STATUS_TEXT } from "../constants/statusText";

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("zh-CN") : "—";

export const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";

export const formatStatus = (group: keyof typeof STATUS_TEXT, value: string) => {
  const table = STATUS_TEXT[group] as Record<string, string> | undefined;
  return table?.[value] ?? value;
};

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) =>
  ({ LOW: "低风险", MEDIUM: "中风险", HIGH: "高风险", CRITICAL: "严重风险", EXTREME: "极高风险" }[value] ?? value);

export const formatRevision = (revisionNo: number) => `R${revisionNo}`;
