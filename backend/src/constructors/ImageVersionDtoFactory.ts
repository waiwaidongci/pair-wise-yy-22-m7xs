import type { ImageVersion } from "../models/ImageVersion";

export const createImageVersionFormDto = (
  overrides: Partial<ImageVersion> = {}
): Omit<ImageVersion, "id"> => ({
  relic_id: 0,
  plan_id: 0,
  version_no: "",
  image_type: "BEFORE",
  file_path: "",
  capture_at: "",
  note: "",
  uploaded_by: 0,
  uploaded_by_name: "",
  archived: false,
  affected: false,
  created_at: "",
  ...overrides
});

export const createImageVersionResponseDto = (row: ImageVersion): ImageVersion => ({ ...row });

export const createImageVersionDto = createImageVersionFormDto;
