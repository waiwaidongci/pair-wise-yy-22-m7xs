import { request } from "./client";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanDossier } from "../types/Dossier";

export interface PlanCreatePayload {
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
}

export interface PlanUpdatePayload {
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
}

export function listRestorationPlan(relicId?: number): Promise<RestorationPlan[]> {
  return request<RestorationPlan[]>(
    relicId !== undefined ? `/restoration-plan?relic_id=${relicId}` : "/restoration-plan"
  );
}

export function getPlanDossier(id: number): Promise<PlanDossier> {
  return request<PlanDossier>(`/restoration-plan/${id}`);
}

export function createPlan(payload: PlanCreatePayload): Promise<RestorationPlan> {
  return request<RestorationPlan>("/restoration-plan", { method: "POST", body: payload });
}

/** 修改方案内容：已提交待审批的方案被改后会被后端退回草稿 */
export function updatePlan(id: number, payload: PlanUpdatePayload): Promise<RestorationPlan> {
  return request<RestorationPlan>(`/restoration-plan/${id}`, { method: "PATCH", body: payload });
}

export function submitPlan(id: number): Promise<RestorationPlan> {
  return request<RestorationPlan>(`/restoration-plan/${id}/submit`, { method: "POST" });
}

export interface PlanReviewPayload {
  approved: boolean;
  comment?: string;
  /** 进入审批页时读到的版本号：两人同时审批，后到者会收到 ALREADY_PROCESSED */
  expected_version: number;
}

export function reviewPlan(id: number, payload: PlanReviewPayload): Promise<RestorationPlan> {
  return request<RestorationPlan>(`/restoration-plan/${id}/review`, {
    method: "POST",
    body: payload
  });
}

export interface PlanCorrectPayload extends PlanUpdatePayload {
  corrected_reason: string;
}

/** 方案更正：原方案及步骤/影像保留旧档标受影响，生成修订版重新审批 */
export function correctPlan(id: number, payload: PlanCorrectPayload): Promise<RestorationPlan> {
  return request<RestorationPlan>(`/restoration-plan/${id}/correct`, {
    method: "POST",
    body: payload
  });
}

export function archivePlan(id: number): Promise<RestorationPlan> {
  return request<RestorationPlan>(`/restoration-plan/${id}/archive`, { method: "POST" });
}
