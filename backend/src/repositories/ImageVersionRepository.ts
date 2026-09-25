import { db } from "./db";
import type { ImageVersion } from "../models/ImageVersion";

export const imageVersionRepository = {
  findAll: (): ImageVersion[] => [...db.imageVersion],
  findById: (id: number): ImageVersion | undefined =>
    db.imageVersion.find((row) => row.id === id),
  findByPlan: (planId: number): ImageVersion[] =>
    db.imageVersion.filter((row) => row.plan_id === planId),
  findByRelic: (relicId: number): ImageVersion[] =>
    db.imageVersion.filter((row) => row.relic_id === relicId),
  findByPlanAndType: (planId: number, imageType: ImageVersion["image_type"]): ImageVersion | undefined =>
    db.imageVersion.find((row) => row.plan_id === planId && row.image_type === imageType),
  countByPlan: (planId: number): number =>
    db.imageVersion.filter((row) => row.plan_id === planId).length,
  create: (row: ImageVersion): ImageVersion => {
    db.imageVersion.push(row);
    return row;
  },
  update: (id: number, patch: Partial<ImageVersion>): ImageVersion | undefined => {
    const row = db.imageVersion.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  },
  markArchivedByPlan: (planId: number) => {
    db.imageVersion
      .filter((row) => row.plan_id === planId)
      .forEach((row) => {
        row.archived = true;
      });
  }
};
