import { create } from "zustand";
import { listRestorationStep, createStep, finishStep } from "../api/RestorationStep";
import type { StepCreatePayload, StepFinishPayload } from "../api/RestorationStep";
import type { RestorationStep } from "../types/RestorationStep";

type State = {
  rows: RestorationStep[];
  loading: boolean;
  load: (planId?: number) => Promise<void>;
  create: (planId: number, payload: StepCreatePayload) => Promise<RestorationStep>;
  finish: (id: number, payload: StepFinishPayload) => Promise<RestorationStep>;
};

export const useRestorationStepStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(planId) {
    set({ loading: true });
    try {
      set({ rows: await listRestorationStep(planId) });
    } finally {
      set({ loading: false });
    }
  },
  async create(planId, payload) {
    return createStep(planId, payload);
  },
  async finish(id, payload) {
    return finishStep(id, payload);
  }
}));
