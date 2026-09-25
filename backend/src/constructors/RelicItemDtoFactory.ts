import type { RelicItem } from "../models/RelicItem";

export const createRelicItemFormDto = (
  overrides: Partial<RelicItem> = {}
): Omit<RelicItem, "id"> => ({
  relic_code: "",
  name: "",
  era: "",
  material: "",
  collection_level: "三级",
  storage_location: "",
  current_condition: "STABLE",
  ...overrides
});

export const createRelicItemResponseDto = (row: RelicItem): RelicItem => ({ ...row });

export const createRelicItemDto = createRelicItemFormDto;
