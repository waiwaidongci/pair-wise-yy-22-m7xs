import type { ImageType, ImageArchived } from "../constants/ImageType";

export interface ImageVersion {
  id: number;
  relic_id: number;
  plan_id: number;
  plan_no: string;
  /** 方案内影像版本号，从 1 递增 */
  version_no: number;
  image_type: ImageType | string;
  file_path: string;
  capture_at: string;
  note: string;
  uploaded_by: string;
  archived: ImageArchived | string;
  archived_at: string | null;
  affected: boolean;
  affected_reason: string | null;
  created_at: string;
}
