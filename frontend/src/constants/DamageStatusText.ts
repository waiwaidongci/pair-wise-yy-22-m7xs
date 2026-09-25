import type { DamageStatus } from "./DamageStatus";
export const DamageStatusText: Record<DamageStatus, string> = {
  REGISTERED: "已登记",
  IN_TREATMENT: "修复中",
  CLOSED: "已关闭",
  SUPERSEDED: "已更正"
};
