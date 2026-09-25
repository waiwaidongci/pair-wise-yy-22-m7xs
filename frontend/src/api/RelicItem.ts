import { request } from "./client";
import type { RelicItem } from "../types/RelicItem";
import type { DamageRecord } from "../types/DamageRecord";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";
import type { ImageVersion } from "../types/ImageVersion";

export interface RelicDetail {
  relic: RelicItem;
  damages: DamageRecord[];
  plans: RestorationPlan[];
  steps: RestorationStep[];
  images: ImageVersion[];
}

export interface RelicItemPayload {
  relic_code: string;
  name: string;
  era: string;
  material: string;
  collection_level: string;
  storage_location: string;
  current_condition?: string;
}

export const listRelicItem = () => request<RelicItem[]>("/relic-item");
export const getRelicDetail = (id: number) => request<RelicDetail>(`/relic-item/${id}`);
export const saveRelicItem = (payload: RelicItemPayload) =>
  request<RelicItem>("/relic-item", { method: "POST", body: JSON.stringify(payload) });
export const updateRelicCondition = (id: number, current_condition: string) =>
  request<RelicItem>(`/relic-item/${id}/condition`, {
    method: "PATCH",
    body: JSON.stringify({ current_condition })
  });
