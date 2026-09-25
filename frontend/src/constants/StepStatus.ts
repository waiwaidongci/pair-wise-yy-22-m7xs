export const StepStatus = ["PENDING", "FINISHED"] as const;
export type StepStatus = (typeof StepStatus)[number];

export const StepStatusText: Record<StepStatus, string> = {
  PENDING: "待执行",
  FINISHED: "已完成"
};
