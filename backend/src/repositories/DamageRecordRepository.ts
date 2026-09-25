import { db, type InMemoryDatabase } from "../database/inMemoryDb";
import type { DamageRecord } from "../models/DamageRecord";

class DamageRecordRepository {
  findAll(context: InMemoryDatabase = db): DamageRecord[] {
    return context.damageRecords;
  }

  findById(id: number, context: InMemoryDatabase = db): DamageRecord | undefined {
    return context.damageRecords.find((row) => row.id === id);
  }

  findByRelic(relicId: number, context: InMemoryDatabase = db): DamageRecord[] {
    return context.damageRecords
      .filter((row) => row.relic_id === relicId)
      .sort((a, b) => a.id - b.id);
  }

  /** 同一病害编号的全部修订版本，按版本号升序 */
  findRevisions(damageNo: string, context: InMemoryDatabase = db): DamageRecord[] {
    return context.damageRecords
      .filter((row) => row.damage_no === damageNo)
      .sort((a, b) => a.revision - b.revision);
  }

  latestRevision(damageNo: string, context: InMemoryDatabase = db): DamageRecord | undefined {
    return this.findRevisions(damageNo, context).at(-1);
  }

  insert(row: Omit<DamageRecord, "id">, context: InMemoryDatabase = db): DamageRecord {
    const record: DamageRecord = { ...row, id: context.nextId("damageRecords") };
    context.damageRecords.push(record);
    return record;
  }

  update(id: number, patch: Partial<DamageRecord>, context: InMemoryDatabase = db): DamageRecord {
    const record = this.findById(id, context);
    Object.assign(record as object, patch);
    return record as DamageRecord;
  }

  nextDamageNo(context: InMemoryDatabase = db): string {
    const year = new Date().getFullYear();
    const count = context.damageRecords.length + 1;
    return `BH-${year}-${String(count).padStart(3, "0")}`;
  }
}

export const damageRecordRepository = new DamageRecordRepository();
