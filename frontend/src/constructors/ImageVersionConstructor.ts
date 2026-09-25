import type { ImageVersion } from "../types/ImageVersion";
import type { ImageUploadPayload } from "../api/ImageVersion";

/** 上传影像表单：修复前 / 修复后，路径模拟文件上传后的归档地址 */
export const createImageVersionForm = (
  imageType: "BEFORE" | "AFTER",
  overrides: Partial<ImageUploadPayload> = {}
): ImageUploadPayload => ({
  image_type: imageType,
  file_path: "",
  note: "",
  ...overrides
});

export const createImageVersionResponse = (row: ImageVersion): ImageVersion => ({ ...row });

export const createDefaultImageVersion = createImageVersionForm;
