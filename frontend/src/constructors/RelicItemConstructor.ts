import type { RelicItem } from "../types/RelicItem";
import type { RelicCondition } from "../constants/RelicCondition";

export interface RelicItemFormValues {
  relic_code: string;
  name: string;
  era: string;
  material: string;
  collection_level: string;
  storage_location: string;
  current_condition: RelicCondition | string;
}

/** 藏品建档表单默认值 */
export const createRelicItemForm = (overrides: Partial<RelicItemFormValues> = {}): RelicItemFormValues => ({
  relic_code: "",
  name: "",
  era: "",
  material: "",
  collection_level: "",
  storage_location: "",
  current_condition: "STABLE",
  ...overrides
});

/** 详情响应对象（页面统一从该构造器取得标准结构，不散写字段） */
export const createRelicItemResponse = (row: RelicItem): RelicItem => ({ ...row });

export const createDefaultRelicItem = createRelicItemForm;
