import { create } from "zustand";
import { listImageVersion, uploadImage } from "../api/ImageVersion";
import type { ImageUploadPayload } from "../api/ImageVersion";
import type { ImageVersion } from "../types/ImageVersion";

type State = {
  rows: ImageVersion[];
  loading: boolean;
  load: (params?: { relicId?: number; planId?: number }) => Promise<void>;
  upload: (planId: number, payload: ImageUploadPayload) => Promise<ImageVersion>;
};

export const useImageVersionStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load(params) {
    set({ loading: true });
    try {
      set({ rows: await listImageVersion(params) });
    } finally {
      set({ loading: false });
    }
  },
  async upload(planId, payload) {
    return uploadImage(planId, payload);
  }
}));
