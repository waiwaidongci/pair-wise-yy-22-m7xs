export interface ImageVersion {
  id: number;
  relic_id: number;
  plan_id: number;
  version_no: string;
  image_type: string;
  file_path: string;
  capture_at: string;
  note: string;
  uploaded_by: number;
  uploaded_by_name: string;
  archived: boolean;
  affected: boolean;
  created_at: string;
}
