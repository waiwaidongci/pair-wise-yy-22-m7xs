import { db, type InMemoryDatabase } from "../database/inMemoryDb";
import type { RelicItem } from "../models/RelicItem";

class RelicItemRepository {
  findAll(context: InMemoryDatabase = db): RelicItem[] {
    return context.relicItems;
  }

  findById(id: number, context: InMemoryDatabase = db): RelicItem | undefined {
    return context.relicItems.find((row) => row.id === id);
  }

  insert(row: Omit<RelicItem, "id">, context: InMemoryDatabase = db): RelicItem {
    const record: RelicItem = { ...row, id: context.nextId("relicItems") };
    context.relicItems.push(record);
    return record;
  }

  update(id: number, patch: Partial<RelicItem>, context: InMemoryDatabase = db): RelicItem {
    const record = this.findById(id, context);
    Object.assign(record as object, patch);
    return record as RelicItem;
  }
}

export const relicItemRepository = new RelicItemRepository();
