import type { RestorationStep } from "../types/RestorationStep";
import type { StepCreatePayload } from "../api/RestorationStep";

/** 拆步骤表单：记录工序与材料；操作人/完成时间在“完成步骤”时回写 */
export const createRestorationStepForm = (
  overrides: Partial<StepCreatePayload> = {}
): StepCreatePayload => ({
  technique: "",
  material_used: "",
  ...overrides
});

export const createRestorationStepResponse = (row: RestorationStep): RestorationStep => ({ ...row });

export const createDefaultRestorationStep = createRestorationStepForm;
