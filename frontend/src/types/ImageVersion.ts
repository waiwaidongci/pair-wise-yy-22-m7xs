export type ImageTypeValue = "BEFORE" | "AFTER";
export type ImageArchivedValue = "ACTIVE" | "ARCHIVED";

export interface ImageVersion {
  id: number;
  relic_id: number;
  plan_id: number;
  plan_no: string;
  version_no: number;
  image_type: ImageTypeValue | string;
  file_path: string;
  capture_at: string;
  note: string;
  uploaded_by: string;
  archived: ImageArchivedValue | string;
  archived_at: string | null;
  affected: boolean;
  affected_reason: string | null;
  created_at: string;
}
