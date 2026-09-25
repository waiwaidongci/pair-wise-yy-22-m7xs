import { create } from "zustand";
import { listDamageRecord, registerDamage, correctDamage } from "../api/DamageRecord";
import type { DamageRecord } from "../types/DamageRecord";
import type { DamageRegisterPayload, DamageCorrectPayload } from "../api/DamageRecord";

type State = {
  rows: DamageRecord[];
  loading: boolean;
  load: (relicId?: number) => Promise<void>;
  register: (payload: DamageRegisterPayload) => Promise<DamageRecord>;
  correct: (id: number, payload: DamageCorrectPayload) => Promise<DamageRecord>;
};

export const useDamageRecordStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(relicId) {
    set({ loading: true });
    try {
      set({ rows: await listDamageRecord(relicId) });
    } finally {
      set({ loading: false });
    }
  },
  async register(payload) {
    return registerDamage(payload);
  },
  async correct(id, payload) {
    return correctDamage(id, payload);
  }
}));
