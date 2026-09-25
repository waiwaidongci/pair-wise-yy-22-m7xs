/** 影像类型：修复前 / 修复后 */
export const ImageType = ["BEFORE", "AFTER"] as const;
export type ImageType = (typeof ImageType)[number];

export const ImageArchived = ["ACTIVE", "ARCHIVED"] as const;
export type ImageArchived = (typeof ImageArchived)[number];
