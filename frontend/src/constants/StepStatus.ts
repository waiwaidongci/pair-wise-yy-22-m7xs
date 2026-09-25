export const StepStatus = ["PENDING", "COMPLETED"] as const;
export type StepStatus = (typeof StepStatus)[number];
