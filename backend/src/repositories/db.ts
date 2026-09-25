import { seed } from "../seed";
import type { RelicItem } from "../models/RelicItem";
import type { DamageRecord } from "../models/DamageRecord";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ImageVersion } from "../models/ImageVersion";
import type { AuditLog } from "../models/AuditLog";

/**
 * 本地内存数据库：进程内可变集合，替代外部数据库驱动。
 * 写操作必须经过 repositories，且状态迁移在 SerialLock 内完成。
 */
export const db = {
  relicItem: [...seed.relicItem] as RelicItem[],
  damageRecord: [...seed.damageRecord] as DamageRecord[],
  restorationPlan: [...seed.restorationPlan] as RestorationPlan[],
  restorationStep: [...seed.restorationStep] as RestorationStep[],
  imageVersion: [...seed.imageVersion] as ImageVersion[],
  auditLog: [] as AuditLog[]
};
