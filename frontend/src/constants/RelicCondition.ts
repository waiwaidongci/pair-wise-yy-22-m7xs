export const RelicCondition = ["STABLE", "FRAGILE", "DAMAGED", "IN_RESTORATION", "SEALED"] as const;
export type RelicCondition = (typeof RelicCondition)[number];

export const RelicConditionText: Record<RelicCondition, string> = {
  STABLE: "稳定",
  FRAGILE: "脆弱",
  DAMAGED: "病害",
  IN_RESTORATION: "修复中",
  SEALED: "封存"
};
