import { create } from "zustand";
import { listRelicItem } from "../api/RelicItem";
import { listDamageRecord } from "../api/DamageRecord";
import { listRestorationPlan } from "../api/RestorationPlan";
import { listRestorationStep } from "../api/RestorationStep";
import { listImageVersion } from "../api/ImageVersion";
import type { RelicItem } from "../types/RelicItem";
import type { DamageRecord } from "../types/DamageRecord";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";
import type { ImageVersion } from "../types/ImageVersion";

interface ArchiveState {
  relics: RelicItem[];
  damages: DamageRecord[];
  plans: RestorationPlan[];
  steps: RestorationStep[];
  images: ImageVersion[];
  loading: boolean;
  loaded: boolean;
  loadAll: () => Promise<void>;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  relics: [],
  damages: [],
  plans: [],
  steps: [],
  images: [],
  loading: false,
  loaded: false,
  async loadAll() {
    if (get().loading) return;
    set({ loading: true });
    try {
      const [relics, damages, plans, steps, images] = await Promise.all([
        listRelicItem(),
        listDamageRecord(),
        listRestorationPlan(),
        listRestorationStep(),
        listImageVersion()
      ]);
      set({ relics, damages, plans, steps, images, loaded: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));
