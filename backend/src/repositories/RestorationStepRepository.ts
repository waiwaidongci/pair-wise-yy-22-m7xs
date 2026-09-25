import { db } from "./db";
import type { RestorationStep } from "../models/RestorationStep";

export const restorationStepRepository = {
  findAll: (): RestorationStep[] => [...db.restorationStep],
  findById: (id: number): RestorationStep | undefined =>
    db.restorationStep.find((row) => row.id === id),
  findByPlan: (planId: number): RestorationStep[] =>
    db.restorationStep
      .filter((row) => row.plan_id === planId)
      .sort((a, b) => a.step_order - b.step_order),
  existsOrder: (planId: number, stepOrder: number): boolean =>
    db.restorationStep.some((row) => row.plan_id === planId && row.step_order === stepOrder),
  create: (row: RestorationStep): RestorationStep => {
    db.restorationStep.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RestorationStep>): RestorationStep | undefined => {
    const row = db.restorationStep.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
