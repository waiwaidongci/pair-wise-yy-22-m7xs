import { db } from "./db";
import type { DamageRecord } from "../models/DamageRecord";

export const damageRecordRepository = {
  findAll: (): DamageRecord[] => [...db.damageRecord],
  findById: (id: number): DamageRecord | undefined => db.damageRecord.find((row) => row.id === id),
  findByRelic: (relicId: number): DamageRecord[] =>
    db.damageRecord.filter((row) => row.relic_id === relicId),
  /** 同一病害编号下的所有更正版本（含已作废旧档）。 */
  findByDamageNo: (damageNo: string): DamageRecord[] =>
    db.damageRecord.filter((row) => row.damage_no === damageNo),
  findByDamage: (damageRecordId: number): DamageRecord[] =>
    db.damageRecord.filter((row) => row.superseded_by_id === damageRecordId || row.id === damageRecordId),
  latestNoSeq: (): number =>
    db.damageRecord.reduce((max, row) => {
      const seqText = row.damage_no.split("-").pop() ?? "0";
      return Math.max(max, Number(seqText) || 0);
    }, 0),
  create: (row: DamageRecord): DamageRecord => {
    db.damageRecord.push(row);
    return row;
  },
  update: (id: number, patch: Partial<DamageRecord>): DamageRecord | undefined => {
    const row = db.damageRecord.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
