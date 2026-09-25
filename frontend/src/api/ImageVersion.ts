import { request } from "./client";
import type { ImageVersion } from "../types/ImageVersion";

export interface ImageUploadPayload {
  image_type: "BEFORE" | "AFTER";
  file_path: string;
  note?: string;
  capture_at?: string;
}

export function listImageVersion(params: { relicId?: number; planId?: number } = {}): Promise<ImageVersion[]> {
  const query =
    params.planId !== undefined
      ? `?plan_id=${params.planId}`
      : params.relicId !== undefined
      ? `?relic_id=${params.relicId}`
      : "";
  return request<ImageVersion[]>(`/image-version${query}`);
}

/**
 * 上传修复影像：修复前影像方案通过后可传；
 * 修复后影像必须全部步骤完成后才能传，否则后端返回 FLOW_CONFLICT。
 */
export function uploadImage(planId: number, payload: ImageUploadPayload): Promise<ImageVersion> {
  return request<ImageVersion>(`/image-version/plan/${planId}`, {
    method: "POST",
    body: payload
  });
}
