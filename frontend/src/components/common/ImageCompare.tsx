import { EmptyState } from "./EmptyState";
import { useImageVersionCompare } from "../../hooks/useImageVersionCompare";
import { formatDate } from "../../utils/formatters";
import type { ImageVersion } from "../../types/ImageVersion";

/** 修复前后影像对比：方案详情与影像页共用 */
export function ImageCompare({ images }: { images: ImageVersion[] }) {
  const { before, after, hasBefore, hasAfter } = useImageVersionCompare(images);

  if (!hasBefore && !hasAfter) {
    return (
      <EmptyState
        title="暂无修复影像"
        hint="方案通过后可上传修复前影像；全部步骤完成后可上传修复后影像，二者齐全才能归档。"
      />
    );
  }

  return (
    <div className="image-strip">
      <ImageTile label="修复前" image={before} placeholder={hasBefore ? null : "待上传修复前影像"} />
      <ImageTile label="修复后" image={after} placeholder={hasAfter ? null : "全部步骤完成后上传"} />
    </div>
  );
}

function ImageTile({ label, image, placeholder }: { label: string; image: ImageVersion | null; placeholder: string | null }) {
  return (
    <div className="image-tile">
      <strong>{label}</strong>
      {image ? (
        <>
          <span className="path">{image.file_path}</span>
          <small>{image.note || "无说明"}</small>
          <small>拍摄 {formatDate(image.capture_at)} · {image.uploaded_by}</small>
        </>
      ) : (
        <small className="path">{placeholder}</small>
      )}
    </div>
  );
}
