import type { RestorationStep } from "../models/RestorationStep";
import { nowIso } from "../utils/formatters";

/** 方案通过后拆步骤：新建步骤为待执行，材料先记录、操作人与完成时间完成时回写 */
export const buildRestorationStepRow = (
  planId: number,
  stepOrder: number,
  technique: string,
  materialUsed: string
): Omit<RestorationStep, "id"> => {
  const ts = nowIso();
  return {
    plan_id: planId,
    step_order: stepOrder,
    technique,
    material_used: materialUsed,
    operator_id: null,
    operator: null,
    step_status: "PENDING",
    finished_at: null,
    affected: false,
    affected_reason: null,
    version: 0,
    created_at: ts,
    updated_at: ts
  };
};

export const toRestorationStepDto = (row: RestorationStep): RestorationStep => ({ ...row });
