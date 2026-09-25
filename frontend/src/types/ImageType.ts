export const ImageType = ["BEFORE", "AFTER"] as const;
export type ImageType = (typeof ImageType)[number];

export const ImageTypeText: Record<ImageType, string> = {
  BEFORE: "修复前",
  AFTER: "修复后"
};

export const ImageArchived = ["ACTIVE", "ARCHIVED"] as const;
export type ImageArchived = (typeof ImageArchived)[number];

export const ImageArchivedText: Record<ImageArchived, string> = {
  ACTIVE: "在档",
  ARCHIVED: "已归档"
};
