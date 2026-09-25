import type { ImageType } from "../constants/ImageType";

export interface ImageVersionCreatePayload {
  image_type?: ImageType | string;
  file_path?: string;
  note?: string;
  capture_at?: string;
}
