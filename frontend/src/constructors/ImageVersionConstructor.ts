import type { ImageVersion } from "../types/ImageVersion";

export type ImageVersionForm = Pick<ImageVersion, "image_type" | "file_path" | "note">;

export const createDefaultImageVersion = (
  overrides: Partial<ImageVersionForm> = {}
): ImageVersionForm => ({
  image_type: "BEFORE",
  file_path: "",
  note: "",
  ...overrides
});

export const createImageVersionForm = createDefaultImageVersion;
export const createImageVersionResponse = (row: ImageVersion): ImageVersion => ({ ...row });
