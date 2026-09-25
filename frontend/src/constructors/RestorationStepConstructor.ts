import type { RestorationStep } from "../types/RestorationStep";

export type RestorationStepForm = Pick<RestorationStep, "technique">;

export const createDefaultRestorationStep = (
  overrides: Partial<RestorationStepForm> = {}
): RestorationStepForm => ({
  technique: "",
  ...overrides
});

export const createRestorationStepForm = createDefaultRestorationStep;
export const createRestorationStepResponse = (row: RestorationStep): RestorationStep => ({ ...row });
