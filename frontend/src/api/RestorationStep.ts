import { request } from "./client";
import type { RestorationStep } from "../types/RestorationStep";

export const listRestorationStep = () => request<RestorationStep[]>("/restoration-step");
export const createStep = (planId: number, technique: string) =>
  request<RestorationStep>(`/restoration-step/plan/${planId}`, {
    method: "POST",
    body: JSON.stringify({ technique })
  });
export const completeStep = (id: number, material_used: string) =>
  request<RestorationStep>(`/restoration-step/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ material_used })
  });
