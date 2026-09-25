import type { RestorationStep } from "../models/RestorationStep";

export const createRestorationStepFormDto = (
  overrides: Partial<RestorationStep> = {}
): Omit<RestorationStep, "id"> => ({
  plan_id: 0,
  step_order: 1,
  technique: "",
  material_used: null,
  operator_id: null,
  operator_name: null,
  step_status: "PENDING",
  finished_at: null,
  affected: false,
  created_at: "",
  updated_at: "",
  ...overrides
});

export const createRestorationStepResponseDto = (row: RestorationStep): RestorationStep => ({ ...row });

export const createRestorationStepDto = createRestorationStepFormDto;
