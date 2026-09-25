import { request } from "./client";
import type { ImageVersion } from "../types/ImageVersion";

export interface ImageVersionPayload {
  image_type: "BEFORE" | "AFTER";
  file_path: string;
  note?: string;
  capture_at?: string;
}

export const listImageVersion = () => request<ImageVersion[]>("/image-version");
export const uploadImage = (planId: number, payload: ImageVersionPayload) =>
  request<ImageVersion>(`/image-version/plan/${planId}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
