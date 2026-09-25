import type { RelicItem } from "../models/RelicItem";
import type { DamageRecord } from "../models/DamageRecord";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ImageVersion } from "../models/ImageVersion";
import type { AuditLog } from "../models/AuditLog";

export interface DatabaseShape {
  relicItems: RelicItem[];
  damageRecords: DamageRecord[];
  plans: RestorationPlan[];
  steps: RestorationStep[];
  images: ImageVersion[];
  auditLogs: AuditLog[];
  sequences: Record<string, number>;
}

/**
 * 进程内数据库：替代未接线的 Prisma，保持 repository 分层不变。
 * 所有写操作通过 transaction 串行执行——并发请求按到达顺序落库，
 * 配合各记录的 version 乐观锁，实现“两人同时审批/提交步骤，先到者生效”。
 */
export class InMemoryDatabase {
  relicItems: RelicItem[] = [];
  damageRecords: DamageRecord[] = [];
  plans: RestorationPlan[] = [];
  steps: RestorationStep[] = [];
  images: ImageVersion[] = [];
  auditLogs: AuditLog[] = [];
  sequences: Record<string, number> = {};

  private chain: Promise<unknown> = Promise.resolve();

  load(seed: DatabaseShape) {
    this.relicItems = [...seed.relicItems];
    this.damageRecords = [...seed.damageRecords];
    this.plans = [...seed.plans];
    this.steps = [...seed.steps];
    this.images = [...seed.images];
    this.auditLogs = [...seed.auditLogs];
    this.sequences = { ...seed.sequences };
  }

  nextId(table: keyof Omit<DatabaseShape, "sequences">): number {
    this.sequences[table] = (this.sequences[table] ?? 0) + 1;
    return this.sequences[table];
  }

  /** 串行写事务：后一个写请求一定在前一个完成后才执行 */
  transaction<T>(fn: (db: InMemoryDatabase) => T): Promise<T> {
    const run = this.chain.then(() => fn(this));
    this.chain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}

export const db = new InMemoryDatabase();
