import type { RelicCondition } from "../constants/RelicCondition";

export interface RelicItemCreatePayload {
  relic_code?: string;
  name?: string;
  era?: string;
  material?: string;
  collection_level?: string;
  storage_location?: string;
  current_condition?: RelicCondition | string;
}

export interface RelicItemUpdatePayload {
  name?: string;
  era?: string;
  material?: string;
  collection_level?: string;
  storage_location?: string;
  current_condition?: RelicCondition | string;
}
