import { useMemo, useState } from "react";
import type { ImageVersion } from "../types/ImageVersion";

/**
 * 修复前后影像对比 hook：从方案影像中选出最近一版修复前/修复后影像，
 * 并提供版本切换（同一类型可能存在多个版本）。
 */
export function useImageVersionCompare(images: ImageVersion[] = []) {
  const beforeImages = useMemo(
    () => images.filter((image) => image.image_type === "BEFORE"),
    [images]
  );
  const afterImages = useMemo(
    () => images.filter((image) => image.image_type === "AFTER"),
    [images]
  );

  const [beforeIndex, setBeforeIndex] = useState(beforeImages.length - 1);
  const [afterIndex, setAfterIndex] = useState(afterImages.length - 1);

  const before = beforeImages[Math.min(Math.max(beforeIndex, 0), beforeImages.length - 1)] ?? null;
  const after = afterImages[Math.min(Math.max(afterIndex, 0), afterImages.length - 1)] ?? null;

  return {
    before,
    after,
    beforeImages,
    afterImages,
    hasBefore: beforeImages.length > 0,
    hasAfter: afterImages.length > 0,
    selectBefore: setBeforeIndex,
    selectAfter: setAfterIndex
  };
}
