import type { RelicItem } from "../types/RelicItem";

export type RelicItemForm = Omit<RelicItem, "id">;

export const createDefaultRelicItem = (overrides: Partial<RelicItemForm> = {}): RelicItemForm => ({
  relic_code: "",
  name: "",
  era: "",
  material: "",
  collection_level: "三级",
  storage_location: "",
  current_condition: "STABLE",
  ...overrides
});

export const createRelicItemForm = createDefaultRelicItem;
export const createRelicItemResponse = (row: RelicItem): RelicItem => ({ ...row });
