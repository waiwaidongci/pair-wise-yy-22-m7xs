import { db, type InMemoryDatabase } from "../database/inMemoryDb";
import type { RestorationStep } from "../models/RestorationStep";

class RestorationStepRepository {
  findAll(context: InMemoryDatabase = db): RestorationStep[] {
    return context.steps;
  }

  findById(id: number, context: InMemoryDatabase = db): RestorationStep | undefined {
    return context.steps.find((row) => row.id === id);
  }

  findByPlan(planId: number, context: InMemoryDatabase = db): RestorationStep[] {
    return context.steps
      .filter((row) => row.plan_id === planId)
      .sort((a, b) => a.step_order - b.step_order);
  }

  insert(row: Omit<RestorationStep, "id">, context: InMemoryDatabase = db): RestorationStep {
    const record: RestorationStep = { ...row, id: context.nextId("steps") };
    context.steps.push(record);
    return record;
  }

  update(id: number, patch: Partial<RestorationStep>, context: InMemoryDatabase = db): RestorationStep {
    const record = this.findById(id, context);
    Object.assign(record as object, patch);
    return record as RestorationStep;
  }
}

export const restorationStepRepository = new RestorationStepRepository();
