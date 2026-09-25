import { useState } from "react";
import type { ImageVersion } from "../../types/ImageVersion";
import { ImageTypeText } from "../../constants/ImageTypeText";
import { Field } from "../common/Field";
import { ActionButton } from "../common/ActionButton";

interface ImageUploadFormProps {
  imageType: "BEFORE" | "AFTER";
  disabled?: boolean;
  uploading: boolean;
  existing?: ImageVersion;
  onUpload: (payload: { image_type: "BEFORE" | "AFTER"; file_path: string; note?: string }) => Promise<void>;
}

export function ImageUploadForm({ imageType, disabled, uploading, existing, onUpload }: ImageUploadFormProps) {
  const [filePath, setFilePath] = useState("");
  const [note, setNote] = useState("");

  if (existing) return null;

  const submit = async () => {
    if (!filePath.trim()) return;
    await onUpload({ image_type: imageType, file_path: filePath.trim(), note: note.trim() || undefined });
    setFilePath("");
    setNote("");
  };

  return (
    <div className="upload-form">
      <Field label={`${ImageTypeText[imageType]}影像路径`} required hint="本地档案路径，如 /archive/2026/001/after-01.jpg">
        <input
          value={filePath}
          disabled={disabled || uploading}
          placeholder="填写扫描归档路径"
          onChange={(event) => setFilePath(event.target.value)}
        />
      </Field>
      <Field label="影像说明">
        <input
          value={note}
          disabled={disabled || uploading}
          placeholder="拍摄部位 / 取证说明"
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
      <ActionButton tone="primary" size="small" disabled={disabled || uploading || !filePath.trim()} onClick={submit}>
        {uploading ? "上传中…" : `上传${ImageTypeText[imageType]}影像`}
      </ActionButton>
    </div>
  );
}
