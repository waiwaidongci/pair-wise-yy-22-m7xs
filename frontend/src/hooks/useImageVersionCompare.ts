import { useMemo, useState } from "react";
import { uploadImage, type ImageVersionPayload } from "../api/ImageVersion";
import type { ImageVersion } from "../types/ImageVersion";
import { ApiError } from "../api/client";
import { toast } from "../utils/toast";

/** 按方案聚齐修复前/修复后影像，并提供上传动作；归档前由页面校验两侧齐全。 */
export function useImageVersionCompare(images: ImageVersion[], planId: number, onChanged: () => Promise<void> | void) {
  const [uploading, setUploading] = useState<"BEFORE" | "AFTER" | null>(null);

  const planImages = useMemo(() => images.filter((image) => image.plan_id === planId), [images, planId]);
  const before = useMemo(() => planImages.find((image) => image.image_type === "BEFORE"), [planImages]);
  const after = useMemo(() => planImages.find((image) => image.image_type === "AFTER"), [planImages]);
  const ready = !!before && !!after;

  const upload = async (payload: ImageVersionPayload) => {
    setUploading(payload.image_type);
    try {
      await uploadImage(planId, payload);
      toast.success(`${payload.image_type === "BEFORE" ? "修复前" : "修复后"}影像已上传`);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "影像上传失败");
    } finally {
      setUploading(null);
    }
  };

  return { before, after, ready, planImages, uploading, upload };
}
