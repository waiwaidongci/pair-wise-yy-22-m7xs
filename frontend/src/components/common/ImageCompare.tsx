import type { ImageVersion } from "../../types/ImageVersion";
import { formatDateTime } from "../../utils/formatters";
import { ImageTypeText } from "../../constants/ImageTypeText";
import { AffectedTag } from "./AffectedTag";
import { EmptyState } from "./EmptyState";

interface ImageCompareProps {
  before?: ImageVersion;
  after?: ImageVersion;
}

/** 修复前后影像对照：缺失一侧时给出占位与流程提示。 */
export function ImageCompare({ before, after }: ImageCompareProps) {
  return (
    <div className="image-compare">
      {[
        { label: ImageTypeText.BEFORE, image: before, hint: "方案通过后先上传修复前取证照" },
        { label: ImageTypeText.AFTER, image: after, hint: "全部步骤完成后上传修复后照" }
      ].map((side) => (
        <figure key={side.label} className="image-frame">
          <figcaption>
            <strong>{side.label}</strong>
            {side.image && <AffectedTag affected={side.image.affected} />}
          </figcaption>
          {side.image ? (
            <div className="image-placeholder has-file">
              <span className="file-icon">▣</span>
              <p>{side.image.file_path}</p>
              <small className="muted">
                {side.image.uploaded_by_name} · {formatDateTime(side.image.capture_at)}
              </small>
              {side.image.note && <small className="image-note">{side.image.note}</small>}
            </div>
          ) : (
            <EmptyState title={side.hint} />
          )}
        </figure>
      ))}
    </div>
  );
}
