import type { RelicItem } from "../models/RelicItem";
import { nowIso } from "../utils/formatters";

/** 新建藏品入库结构（id 由 repository 分配） */
export const buildRelicItemRow = (
  fields: Pick<RelicItem, "relic_code" | "name" | "era" | "material" | "collection_level" | "storage_location" | "current_condition">
): Omit<RelicItem, "id"> => ({
  ...fields,
  updated_at: nowIso()
});

/** 对外响应 DTO */
export const toRelicItemDto = (row: RelicItem): RelicItem => ({ ...row });
