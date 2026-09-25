import { create } from "zustand";
import { listRelicItem, createRelicItem } from "../api/RelicItem";
import type { RelicItem } from "../types/RelicItem";

type State = {
  rows: RelicItem[];
  loading: boolean;
  load: () => Promise<void>;
  create: (payload: Partial<RelicItem>) => Promise<RelicItem>;
};

export const useRelicItemStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    try {
      set({ rows: await listRelicItem() });
    } finally {
      set({ loading: false });
    }
  },
  async create(payload) {
    const relic = await createRelicItem(payload);
    await get().load();
    return relic;
  }
}));
