import { request } from "./client";
import type { RestorationStep } from "../types/RestorationStep";

export interface StepCreatePayload {
  technique: string;
  material_used: string;
}

export interface StepFinishPayload {
  material_used?: string;
  /** 进入页面时读到的步骤版本号：两人同时提交，后到者收到 ALREADY_PROCESSED */
  expected_version: number;
}

export function listRestorationStep(planId?: number): Promise<RestorationStep[]> {
  return request<RestorationStep[]>(
    planId !== undefined ? `/restoration-step?plan_id=${planId}` : "/restoration-step"
  );
}

/** 拆步骤：仅审批通过的方案允许 */
export function createStep(planId: number, payload: StepCreatePayload): Promise<RestorationStep> {
  return request<RestorationStep>(`/restoration-step/plan/${planId}`, {
    method: "POST",
    body: payload
  });
}

/** 完成步骤：回写材料、操作人、完成时间 */
export function finishStep(id: number, payload: StepFinishPayload): Promise<RestorationStep> {
  return request<RestorationStep>(`/restoration-step/${id}/finish`, {
    method: "POST",
    body: payload
  });
}
