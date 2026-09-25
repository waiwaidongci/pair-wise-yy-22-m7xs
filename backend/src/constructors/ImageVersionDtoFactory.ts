import type { ImageVersion } from "../models/ImageVersion";
import type { ImageType } from "../constants/ImageType";
import { nowIso } from "../utils/formatters";

/** 上传影像入库结构：同方案内版本号递增，方案归档时影像一并归档 */
export const buildImageVersionRow = (fields: {
  relicId: number;
  planId: number;
  planNo: string;
  versionNo: number;
  imageType: ImageType;
  filePath: string;
  note: string;
  captureAt: string;
  uploadedBy: string;
}): Omit<ImageVersion, "id"> => ({
  relic_id: fields.relicId,
  plan_id: fields.planId,
  plan_no: fields.planNo,
  version_no: fields.versionNo,
  image_type: fields.imageType,
  file_path: fields.filePath,
  capture_at: fields.captureAt,
  note: fields.note,
  uploaded_by: fields.uploadedBy,
  archived: "ACTIVE",
  archived_at: null,
  affected: false,
  affected_reason: null,
  created_at: nowIso()
});

export const toImageVersionDto = (row: ImageVersion): ImageVersion => ({ ...row });
