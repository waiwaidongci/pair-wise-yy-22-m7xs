import { create } from "zustand";
import { listAuditLog } from "../api/AuditLog";
import type { AuditLog } from "../types/AuditLog";

interface AuditState {
  rows: AuditLog[];
  load: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
  rows: [],
  async load() {
    set({ rows: await listAuditLog() });
  }
}));
