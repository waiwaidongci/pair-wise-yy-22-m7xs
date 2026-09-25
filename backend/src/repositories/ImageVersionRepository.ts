import { db, type InMemoryDatabase } from "../database/inMemoryDb";
import type { ImageVersion } from "../models/ImageVersion";

class ImageVersionRepository {
  findAll(context: InMemoryDatabase = db): ImageVersion[] {
    return context.images;
  }

  findById(id: number, context: InMemoryDatabase = db): ImageVersion | undefined {
    return context.images.find((row) => row.id === id);
  }

  findByPlan(planId: number, context: InMemoryDatabase = db): ImageVersion[] {
    return context.images
      .filter((row) => row.plan_id === planId)
      .sort((a, b) => a.version_no - b.version_no);
  }

  findByRelic(relicId: number, context: InMemoryDatabase = db): ImageVersion[] {
    return context.images
      .filter((row) => row.relic_id === relicId)
      .sort((a, b) => a.id - b.id);
  }

  insert(row: Omit<ImageVersion, "id">, context: InMemoryDatabase = db): ImageVersion {
    const record: ImageVersion = { ...row, id: context.nextId("images") };
    context.images.push(record);
    return record;
  }

  update(id: number, patch: Partial<ImageVersion>, context: InMemoryDatabase = db): ImageVersion {
    const record = this.findById(id, context);
    Object.assign(record as object, patch);
    return record as ImageVersion;
  }
}

export const imageVersionRepository = new ImageVersionRepository();
