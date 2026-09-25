import type { RestorationPlan } from "../../types/RestorationPlan";
import type { ImageVersion } from "../../types/ImageVersion";
import { ImageCompare } from "../common/ImageCompare";
import { ImageUploadForm } from "./ImageUploadForm";
import { useImageVersionCompare } from "../../hooks/useImageVersionCompare";
import { Rbac } from "../common/Rbac";
import { ActionButton } from "../common/ActionButton";

interface ImagesPanelProps {
  plan: RestorationPlan;
  images: ImageVersion[];
  stepsDone: boolean;
  onChanged: () => Promise<void>;
  onArchive: () => Promise<void> | void;
  archiving: boolean;
}

export function ImagesPanel({ plan, images, stepsDone, onChanged, onArchive, archiving }: ImagesPanelProps) {
  const compare = useImageVersionCompare(images, plan.id, onChanged);
  const canArchive = stepsDone && compare.ready && !plan.affected;

  return (
    <section className="panel workflow-panel">
      <div className="panel-head">
        <h3>修复前后影像与归档</h3>
        <Rbac roles={["ARCHIVIST"]}>
          <ActionButton tone="primary" size="small" disabled={!canArchive || archiving} onClick={() => void onArchive()}>
            {archiving ? "归档中…" : "核对影像并归档"}
          </ActionButton>
        </Rbac>
      </div>
      <ImageCompare before={compare.before} after={compare.after} />
      {!plan.affected && (
        <div className="upload-grid">
          {!compare.before && (
            <ImageUploadForm
              imageType="BEFORE"
              uploading={compare.uploading === "BEFORE"}
              onUpload={compare.upload}
            />
          )}
          {!compare.after && (
            <ImageUploadForm
              imageType="AFTER"
              disabled={!stepsDone}
              uploading={compare.uploading === "AFTER"}
              onUpload={compare.upload}
            />
          )}
        </div>
      )}
      {!stepsDone && !compare.after && (
        <p className="flow-hint">修复后影像需在全部步骤完成后上传。</p>
      )}
      {stepsDone && !compare.ready && (
        <p className="flow-hint">修复前、修复后影像均上传后才能归档。</p>
      )}
    </section>
  );
}
