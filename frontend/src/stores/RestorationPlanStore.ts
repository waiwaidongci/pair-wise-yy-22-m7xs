import { create } from "zustand";
import {
  listRestorationPlan,
  createPlan,
  updatePlan,
  submitPlan,
  reviewPlan,
  correctPlan,
  archivePlan
} from "../api/RestorationPlan";
import type { PlanCreatePayload, PlanReviewPayload, PlanCorrectPayload, PlanUpdatePayload } from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  load: (relicId?: number) => Promise<void>;
  create: (payload: PlanCreatePayload) => Promise<RestorationPlan>;
  update: (id: number, payload: PlanUpdatePayload) => Promise<RestorationPlan>;
  submit: (id: number) => Promise<RestorationPlan>;
  review: (id: number, payload: PlanReviewPayload) => Promise<RestorationPlan>;
  correct: (id: number, payload: PlanCorrectPayload) => Promise<RestorationPlan>;
  archive: (id: number) => Promise<RestorationPlan>;
};

export const useRestorationPlanStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(relicId) {
    set({ loading: true });
    try {
      set({ rows: await listRestorationPlan(relicId) });
    } finally {
      set({ loading: false });
    }
  },
  async create(payload) {
    return createPlan(payload);
  },
  async update(id, payload) {
    return updatePlan(id, payload);
  },
  async submit(id) {
    return submitPlan(id);
  },
  async review(id, payload) {
    return reviewPlan(id, payload);
  },
  async correct(id, payload) {
    return correctPlan(id, payload);
  },
  async archive(id) {
    return archivePlan(id);
  }
}));
