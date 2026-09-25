import { db } from "./db";
import type { RelicItem } from "../models/RelicItem";

export const relicItemRepository = {
  findAll: (): RelicItem[] => [...db.relicItem],
  findById: (id: number): RelicItem | undefined => db.relicItem.find((row) => row.id === id),
  create: (row: RelicItem): RelicItem => {
    db.relicItem.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RelicItem>): RelicItem | undefined => {
    const row = db.relicItem.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
