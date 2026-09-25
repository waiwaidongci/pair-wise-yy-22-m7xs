export const DamageStatus = ["REGISTERED", "TREATING", "CLOSED", "CORRECTED"] as const;
export type DamageStatus = (typeof DamageStatus)[number];

export const DamageStatusText: Record<DamageStatus, string> = {
  REGISTERED: "已登记",
  TREATING: "处置中",
  CLOSED: "已关闭",
  CORRECTED: "已更正"
};
