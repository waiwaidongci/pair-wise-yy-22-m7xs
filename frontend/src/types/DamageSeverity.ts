export const DamageSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type DamageSeverity = (typeof DamageSeverity)[number];

export const DamageSeverityText: Record<DamageSeverity, string> = {
  LOW: "轻度",
  MEDIUM: "中度",
  HIGH: "重度",
  CRITICAL: "严重"
};
