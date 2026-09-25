/** 修复步骤状态：方案通过后拆出待执行步骤，操作人完成后回写完成时间 */
export const StepStatus = ["PENDING", "FINISHED"] as const;
export type StepStatus = (typeof StepStatus)[number];
