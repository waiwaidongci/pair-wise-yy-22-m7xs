import { create } from "zustand";
import { getRelicDossier } from "../api/RelicItem";
import { getPlanDossier } from "../api/RestorationPlan";
import type { RelicDossier, PlanDossier } from "../types/Dossier";

type State = {
  /** 当前详情档案 */
  relicDossier: RelicDossier | null;
  planDossier: PlanDossier | null;
  /** 列表页用的档案缓存（relicId -> dossier） */
  summaryCache: Record<number, RelicDossier>;
  loading: boolean;
  /** 操作后强制刷新：并发场景下后到者借此看到“已被处理”后的最新状态 */
  loadRelic: (relicId: number) => Promise<void>;
  /** 只更新列表摘要缓存，不影响当前详情档案 */
  preloadSummary: (relicId: number) => Promise<void>;
  loadPlan: (planId: number) => Promise<void>;
  clearPlan: () => void;
};

export const useDossierStore = create<State>((set) => ({
  relicDossier: null,
  planDossier: null,
  summaryCache: {},
  loading: false,
  async loadRelic(relicId) {
    set({ loading: true });
    try {
      const dossier = await getRelicDossier(relicId);
      set((state) => ({
        relicDossier: dossier,
        summaryCache: { ...state.summaryCache, [relicId]: dossier }
      }));
    } finally {
      set({ loading: false });
    }
  },
  async preloadSummary(relicId) {
    try {
      const dossier = await getRelicDossier(relicId);
      set((state) => ({ summaryCache: { ...state.summaryCache, [relicId]: dossier } }));
    } catch {
      // 摘要加载失败不阻塞列表
    }
  },
  async loadPlan(planId) {
    set({ loading: true });
    try {
      set({ planDossier: await getPlanDossier(planId) });
    } finally {
      set({ loading: false });
    }
  },
  clearPlan() {
    set({ planDossier: null });
  }
}));
