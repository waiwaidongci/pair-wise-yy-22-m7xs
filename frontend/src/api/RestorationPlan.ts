import { request } from "./client";
import type { RestorationPlan } from "../types/RestorationPlan";

export interface RestorationPlanPayload {
  damage_record_id?: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
}

export const listRestorationPlan = () => request<RestorationPlan[]>("/restoration-plan");
export const createRestorationPlan = (payload: RestorationPlanPayload) =>
  request<RestorationPlan>("/restoration-plan", { method: "POST", body: JSON.stringify(payload) });
export const updateRestorationPlan = (id: number, payload: Partial<RestorationPlanPayload>) =>
  request<RestorationPlan>(`/restoration-plan/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
export const submitPlan = (id: number) =>
  request<RestorationPlan>(`/restoration-plan/${id}/submit`, { method: "POST" });
export const approvePlan = (id: number) =>
  request<RestorationPlan>(`/restoration-plan/${id}/approve`, { method: "POST", body: "{}" });
export const rejectPlan = (id: number, comment: string) =>
  request<RestorationPlan>(`/restoration-plan/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ comment })
  });
export const correctPlan = (id: number, payload: Partial<RestorationPlanPayload>) =>
  request<RestorationPlan>(`/restoration-plan/${id}/correct`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
export const archivePlan = (id: number) =>
  request<RestorationPlan>(`/restoration-plan/${id}/archive`, { method: "POST" });
