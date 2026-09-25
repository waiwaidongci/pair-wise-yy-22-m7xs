export const ImageType = ["BEFORE", "AFTER"] as const;
export type ImageType = (typeof ImageType)[number];
